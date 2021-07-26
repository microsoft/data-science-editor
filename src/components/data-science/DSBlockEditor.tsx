import { Grid, NoSsr } from "@material-ui/core"
import React, { useContext, useMemo } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import BlockEditor from "../blockly/BlockEditor"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "../../../jacdac-ts/src/dsl/workspacejson"
import dataDsl from "../blockly/dsl/datadsl"
import chartDsl from "../blockly/dsl/chartdsl"
import fieldsDsl from "../blockly/dsl/fieldsdsl"

const DS_EDITOR_ID = "ds"
const DS_SOURCE_STORAGE_KEY = "tools:dseditor"
const DS_NEW_FILE_CONTENT = JSON.stringify({
    editor: DS_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function DSEditorWithContext() {
    const { workspaceFileHandle, setWorkspaceFileHandle } =
        useContext(BlockContext)

    return (
        <Grid container direction="column" spacing={1}>
            {!!setWorkspaceFileHandle && (
                <Grid item xs={12}>
                    <FileTabs
                        storageKey={DS_SOURCE_STORAGE_KEY}
                        selectedFileHandle={workspaceFileHandle}
                        onFileHandleSelected={setWorkspaceFileHandle}
                        onFileHandleCreated={setWorkspaceFileHandle}
                        newFileContent={DS_NEW_FILE_CONTENT}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockEditor editorId={DS_EDITOR_ID} />
            </Grid>
            {Flags.diagnostics && <BlockDiagnostics />}
        </Grid>
    )
}

export default function DSBlockEditor() {
    const dsls = useMemo(() => {
        return [dataDsl, chartDsl, fieldsDsl]
    }, [])

    return (
        <NoSsr>
            <BlockProvider storageKey={DS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <DSEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
