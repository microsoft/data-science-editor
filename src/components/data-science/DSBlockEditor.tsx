import { Grid, NoSsr } from "@material-ui/core"
import React, { useContext, useMemo } from "react"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { BlockProvider } from "../blockly/BlockContext"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import BlockEditor from "../blockly/BlockEditor"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "../blockly/dsl/workspacejson"
import dataDsl from "../blockly/dsl/datadsl"
import chartDsl from "../blockly/dsl/chartdsl"
import fieldsDsl from "../blockly/dsl/fieldsdsl"
import { WORKSPACE_FILENAME } from "../blockly/toolbox"
import FileSystemContext from "../FileSystemContext"
import { createIFrameDSL } from "../blockly/dsl/iframedsl"

const DS_EDITOR_ID = "ds"
const DS_SOURCE_STORAGE_KEY = "tools:dseditor"
const DS_NEW_FILE_CONTENT = JSON.stringify({
    editor: DS_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function DSEditorWithContext() {
    const { fileSystem } = useContext(FileSystemContext)

    return (
        <Grid container direction="column" spacing={1}>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={DS_NEW_FILE_CONTENT}
                        hideFiles={true}
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
        return [dataDsl, chartDsl, fieldsDsl, createIFrameDSL("host", "*")].filter(
            dsl => !!dsl
        )
    }, [])

    return (
        <NoSsr>
            <BlockProvider storageKey={DS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <DSEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
