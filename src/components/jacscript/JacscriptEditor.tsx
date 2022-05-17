import { Grid, NoSsr } from "@mui/material"
import React, {
    lazy,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import workspaceJSONToJacscriptProgram from "./JacscriptGenerator"
import BlockEditor from "../blockly/BlockEditor"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { JACSCRIPT_WARNINGS_CATEGORY } from "../blockly/toolbox"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import jacscriptDsls from "./jacscriptdsls"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import { toJacscript } from "../../../jacdac-ts/src/vm/ir2jacscript"
import JacscriptEditorToolbar from "./JacscriptEditorToolbar"
import useJacscript, { JacscriptProvider } from "./JacscriptContext"

import Suspense from "../ui/Suspense"
const JacscriptDiagnostics = lazy(() => import("./JacscriptDiagnostics"))
const VMDiagnostics = lazy(() => import("./VMDiagnostics"))
const BlockDiagnostics = lazy(() => import("../blockly/BlockDiagnostics"))

export const JACSCRIPT_EDITOR_ID = "jcs"
const JACSCRIPT_SOURCE_STORAGE_KEY = "tools:jacscripteditor"
export const JACSCRIPT_NEW_FILE_CONTENT = JSON.stringify({
    editor: JACSCRIPT_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function JacscriptEditorWithContext() {
    const { dsls, workspaceJSON, roleManager, setWarnings } =
        useContext(BlockContext)
    const [program, setProgram] = useState<VMProgram>()
    const { setProgram: setJscProgram } = useJacscript()

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

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} sm={8}>
                <Grid container direction="column" spacing={1}>
                    <JacscriptEditorToolbar />
                    <Grid item xs={12}>
                        <BlockEditor />
                    </Grid>
                    {Flags.diagnostics && (
                        <>
                            <Suspense>
                                <VMDiagnostics program={program} />
                            </Suspense>
                            <Suspense>
                                <BlockDiagnostics />
                            </Suspense>
                        </>
                    )}
                </Grid>
            </Grid>
            <Grid item>
                <Suspense>
                    <JacscriptDiagnostics />
                </Suspense>
            </Grid>
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
            <JacscriptProvider>
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
            </JacscriptProvider>
        </NoSsr>
    )
}
