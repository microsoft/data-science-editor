import { Grid, NoSsr } from "@mui/material"
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import useVMRunner from "./useVMRunner"
import VMDiagnostics from "./VMDiagnostics"
import VMToolbar from "./VMToolbar"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import workspaceJSONToVMProgram from "./VMgenerator"
import BlockEditor from "../blockly/BlockEditor"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import vmDsls from "./vmdsls"
import { VMStatus } from "../../../jacdac-ts/src/vm/runner"
import { VM_WARNINGS_CATEGORY, WORKSPACE_FILENAME } from "../blockly/toolbox"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import FileSystemContext from "../FileSystemContext"
import { resolveWorkspaceServices } from "../blockly/WorkspaceContext"

const VM_EDITOR_ID = "vm"
const VM_SOURCE_STORAGE_KEY = "tools:vmeditor"
const VM_NEW_FILE_CONTENT = JSON.stringify({
    editor: VM_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function VMEditorWithContext() {
    const {
        dsls,
        workspace,
        workspaceJSON,
        roleManager,
        setWarnings,
        dragging,
    } = useContext(BlockContext)
    const { fileSystem } = useContext(FileSystemContext)
    const [program, setProgram] = useState<VMProgram>()
    const autoStart = true
    const { runner, run, cancel } = useVMRunner(roleManager, program, autoStart)

    // don't run the VM while dragging as it glitches the Ui
    useEffect(() => {
        if (runner?.status === VMStatus.Running) cancel()
    }, [runner, dragging])
    useEffect(() => {
        try {
            const newProgram = workspaceJSONToVMProgram(workspaceJSON, dsls)
            if (JSON.stringify(newProgram) !== JSON.stringify(program))
                setProgram(newProgram)
        } catch (e) {
            console.error(e)
            setProgram(undefined)
        }
    }, [dsls, workspaceJSON])
    useEffect(
        () =>
            program &&
            roleManager?.updateRoles([
                ...program.roles,
                ...program.serverRoles.map(r => ({
                    role: r.role,
                    serviceClass: r.serviceClass,
                    preferredDeviceId: "TBD",
                })),
            ]),
        [roleManager, program]
    )
    useEffect(
        () =>
            setWarnings(
                VM_WARNINGS_CATEGORY,
                arrayConcatMany(program?.handlers.map(h => h.errors))
            ),
        [program]
    )

    useEffect(() => {
        const services = resolveWorkspaceServices(workspace)
        if (services) {
            services.runner = runner
        }
    }, [workspace, runner])

    return (
        <Grid container direction="column" spacing={1}>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={VM_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <VMToolbar runner={runner} run={run} cancel={cancel} />
            </Grid>
            <Grid item xs={12}>
                <BlockEditor editorId={VM_EDITOR_ID} />
            </Grid>
            {Flags.diagnostics && (
                <>
                    <VMDiagnostics program={program} />
                    <BlockDiagnostics />
                </>
            )}
        </Grid>
    )
}

export default function VMEditor() {
    const dsls = useMemo(() => {
        return vmDsls
    }, [])
    const handleOnBeforeSaveWorkspaceFile = useCallback(
        (file: WorkspaceFile) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const f = file as any
            f.vm = workspaceJSONToVMProgram(file.json, dsls)
        },
        []
    )

    return (
        <NoSsr>
            <BlockProvider
                storageKey={VM_SOURCE_STORAGE_KEY}
                dsls={dsls}
                onBeforeSaveWorkspaceFile={
                    Flags.diagnostics
                        ? handleOnBeforeSaveWorkspaceFile
                        : undefined
                }
            >
                <VMEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
