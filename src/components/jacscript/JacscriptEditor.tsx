import { Grid, NoSsr } from "@mui/material"
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import VMDiagnostics from "../vm/VMDiagnostics"
import BlockRolesToolbar from "../blockly/BlockRolesToolbar"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import workspaceJSONToVMProgram from "../vm/VMgenerator"
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
    JacScriptProgram,
    toJacScript,
} from "../../../jacdac-ts/src/vm/ir2jacscript"
import useEffectAsync from "../useEffectAsync"
import { jscCompile } from "../blockly/dsl/workers/vm.proxy"
import type { VMCompileResponse } from "../../workers/vm/vm.worker"

const JACSCRIPT_EDITOR_ID = "jcs"
const JACSCRIPT_SOURCE_STORAGE_KEY = "tools:jacscripteditor"
const JACSCRIPT_NEW_FILE_CONTENT = JSON.stringify({
    editor: JACSCRIPT_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function JacScriptEditorWithContext() {
    const { dsls, workspaceJSON, roleManager, setWarnings } =
        useContext(BlockContext)
    const [program, setProgram] = useState<VMProgram>()
    const [jscProgram, setJscProgram] = useState<JacScriptProgram>()
    const [jscCompiled, setJscCompiled] = useState<VMCompileResponse>()
    const { fileSystem } = useContext(FileSystemContext)

    useEffect(() => {
        try {
            const newProgram = workspaceJSONToVMProgram(workspaceJSON, dsls)
            if (JSON.stringify(newProgram) !== JSON.stringify(program)) {
                setProgram(newProgram)
                const jsc = toJacScript(newProgram)
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
            const res =
                jscProgram && (await jscCompile(jscProgram.program.join("\n")))
            console.log({ res, mounted: mounted() })
            if (mounted()) setJscCompiled(res)
        },
        [jscProgram]
    )

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
                        <BlockRolesToolbar></BlockRolesToolbar>
                    </Grid>
                    <Grid item xs={12}>
                        <BlockEditor editorId={JACSCRIPT_EDITOR_ID} />
                    </Grid>
                    {Flags.diagnostics && (
                        <>
                            <VMDiagnostics program={program} />
                            <BlockDiagnostics />
                        </>
                    )}
                </Grid>
            </Grid>
            <JacscriptDiagnostics
                        program={jscProgram}
                        compiled={jscCompiled}
                    />
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
            const program = workspaceJSONToVMProgram(file.json, dsls)
            file.jsc = toJacScript(program)
        },
        []
    )

    return (
        <NoSsr>
            <BlockProvider
                storageKey={JACSCRIPT_SOURCE_STORAGE_KEY}
                dsls={dsls}
                onBeforeSaveWorkspaceFile={
                    Flags.diagnostics
                        ? handleOnBeforeSaveWorkspaceFile
                        : undefined
                }
            >
                <JacScriptEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
