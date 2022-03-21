import { Chip, Grid, NoSsr } from "@mui/material"
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import VMDiagnostics from "./VMDiagnostics"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import workspaceJSONToJacscriptProgram from "./JacscriptGenerator"
import BlockEditor from "../blockly/BlockEditor"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import {
    JACSCRIPT_WARNINGS_CATEGORY,
    WORKSPACE_FILENAME,
} from "../blockly/toolbox"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import FileSystemContext from "../FileSystemContext"
import jacscriptDsls from "./jacscriptdsls"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import JacscriptDiagnostics from "./JacscriptDiagnostics"
import {
    JacscriptProgram,
    toJacscript,
} from "../../../jacdac-ts/src/vm/ir2jacscript"
import useEffectAsync from "../useEffectAsync"
import { jacscriptCompile } from "../blockly/dsl/workers/jacscript.proxy"
import type { JacscriptCompileResponse } from "../../workers/jacscript/jacscript.worker"
import useRegister from "../hooks/useRegister"
import {
    JacscriptManagerCmd,
    JacscriptManagerReg,
    SRV_JACSCRIPT_MANAGER,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import DeviceAvatar from "../devices/DeviceAvatar"
import useBus from "../../jacdac/useBus"
import useServices from "../hooks/useServices"
import { addServiceProvider } from "../../../jacdac-ts/src/servers/servers"
import { createVMJacscriptManagerServer } from "../blockly/dsl/workers/vm.proxy"
import useServiceServer from "../hooks/useServiceServer"
import { JacscriptManagerServer } from "../../../jacdac-ts/src/servers/jacscriptmanagerserver"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"

const JACSCRIPT_EDITOR_ID = "jcs"
const JACSCRIPT_SOURCE_STORAGE_KEY = "tools:jacscripteditor"
const JACSCRIPT_NEW_FILE_CONTENT = JSON.stringify({
    editor: JACSCRIPT_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function JacscriptExecutor(props: { service: JDService }) {
    const { service } = props

    const runningRegister = useRegister(service, JacscriptManagerReg.Running)
    const programSizeRegister = useRegister(
        service,
        JacscriptManagerReg.ProgramSize
    )

    const running = useRegisterBoolValue(runningRegister)
    const [programSize] =
        useRegisterUnpackedValue<[number]>(programSizeRegister)

    const stopped = !running
    const disabled = !service || !programSize

    const handleRun = () => runningRegister?.sendSetBoolAsync(true, true)
    const handleStop = () => runningRegister?.sendSetBoolAsync(false, true)

    const label = disabled ? "..." : running ? "stop" : "start"
    const title = disabled
        ? "loading..."
        : running
        ? "stop running code"
        : "start running code"

    return (
        <Chip
            label={label}
            title={title}
            variant={service ? undefined : "outlined"}
            avatar={service && <DeviceAvatar device={service.device} />}
            onClick={stopped ? handleRun : handleStop}
            disabled={disabled}
        />
    )
}

function JacscriptEditorWithContext() {
    const { dsls, workspaceJSON, roleManager, setWarnings } =
        useContext(BlockContext)
    const bus = useBus()
    const [program, setProgram] = useState<VMProgram>()
    const [jscProgram, setJscProgram] = useState<JacscriptProgram>()
    const [jscCompiled, setJscCompiled] = useState<JacscriptCompileResponse>()
    const { fileSystem } = useContext(FileSystemContext)

    // grab the first jacscript manager, favor physical services first
    const services = useServices({ serviceClass: SRV_JACSCRIPT_MANAGER }).sort(
        (l, r) => -(l.device.isPhysical ? 1 : 0) + (r.device.isPhysical ? 1 : 0)
    )
    const service = services[0]
    const server = useServiceServer<JacscriptManagerServer>(service)

    // spinup vm jacscript manager
    useEffect(() => {
        const provider = addServiceProvider(bus, {
            name: "vm jacscript manager",
            serviceClasses: [SRV_JACSCRIPT_MANAGER],
            services: () => [createVMJacscriptManagerServer()],
        })
        return () => bus.removeServiceProvider(provider)
    }, [])

    useEffect(() => {
        try {
            const newProgram = workspaceJSONToJacscriptProgram(
                workspaceJSON,
                dsls
            )
            if (JSON.stringify(newProgram) !== JSON.stringify(program)) {
                setProgram(newProgram)
                const jsc = toJacscript(newProgram)
                setJscProgram(jsc)
            }
        } catch (e) {
            console.error(e)
            setProgram(undefined)
            setJscProgram(undefined)
        }
    }, [dsls, workspaceJSON])
    useEffect(
        () => program && roleManager?.updateRoles([...program.roles]),
        [roleManager, program]
    )
    useEffect(
        () =>
            setWarnings(
                JACSCRIPT_WARNINGS_CATEGORY,
                arrayConcatMany(program?.handlers.map(h => h.errors))
            ),
        [program]
    )
    useEffectAsync(
        async mounted => {
            const src = jscProgram?.program.join("\n")
            const res = src && (await jacscriptCompile(src))
            if (mounted()) setJscCompiled(res)
        },
        [jscProgram]
    )
    useEffectAsync(async () => {
        const { binary, debugInfo } = jscCompiled || {}
        if (!service) return
        if (server) server.setBytecode(binary, debugInfo)
        else {
            await OutPipe.sendBytes(
                service,
                JacscriptManagerCmd.DeployBytecode,
                binary || new Uint8Array(0)
            )
        }
        //if (jscCompiled) jacscriptCommand("start")
        //else jacscriptCommand("stop")
    }, [service, server, jscCompiled])
    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={8}>
                <Grid container direction="column" spacing={1}>
                    {!!fileSystem && (
                        <Grid item xs={12}>
                            <FileTabs
                                newFileName={WORKSPACE_FILENAME}
                                newFileContent={JACSCRIPT_NEW_FILE_CONTENT}
                                hideFiles={true}
                            />
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <BlockRolesToolbar>
                            <Grid item>
                                <JacscriptExecutor service={service} />
                            </Grid>
                        </BlockRolesToolbar>
                    </Grid>
                    <Grid item xs={12}>
                        <BlockEditor />
                    </Grid>
                    {Flags.diagnostics && (
                        <>
                            <VMDiagnostics program={program} />
                            <BlockDiagnostics />
                        </>
                    )}
                </Grid>
            </Grid>
            <JacscriptDiagnostics program={jscProgram} compiled={jscCompiled} />
        </Grid>
    )
}

export default function JacscriptEditor() {
    const dsls = useMemo(() => {
        return jacscriptDsls
    }, [])
    const handleOnBeforeSaveWorkspaceFile = useCallback(
        (file: WorkspaceFile) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const program = workspaceJSONToJacscriptProgram(file.json, dsls)
            file.jsc = toJacscript(program)
        },
        []
    )

    return (
        <NoSsr>
            <BlockProvider
                editorId={JACSCRIPT_EDITOR_ID}
                storageKey={JACSCRIPT_SOURCE_STORAGE_KEY}
                dsls={dsls}
                onBeforeSaveWorkspaceFile={
                    Flags.diagnostics
                        ? handleOnBeforeSaveWorkspaceFile
                        : undefined
                }
            >
                <JacscriptEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
