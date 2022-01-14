import { Grid, NoSsr } from "@mui/material"
import React, { useContext, useMemo } from "react"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import { BlockProvider } from "./BlockContext"
import BlockDiagnostics from "./BlockDiagnostics"
import BlockEditor from "./BlockEditor"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "./dsl/workspacejson"
import dataDsl from "./dsl/datadsl"
import chartDsl from "./dsl/chartdsl"
import fieldsDsl from "./dsl/fieldsdsl"
import { WORKSPACE_FILENAME } from "./toolbox"
import FileSystemContext from "../FileSystemContext"
import { createIFrameDSL } from "./dsl/iframedsl"
import { useLocationSearchParamBoolean } from "../hooks/useLocationSearchParam"
import dataSetDsl from "./dsl/datasetdsl"
import dataVarDsl from "./dsl/datavardsl"
import sensorsDsl from "./dsl/sensorsdsl"

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
    const sensors = useLocationSearchParamBoolean("sensors", false)
    const dataSet = useLocationSearchParamBoolean("dataset", true)
    const dataVar = useLocationSearchParamBoolean("datavar", true)
    const chart = useLocationSearchParamBoolean("chart", true)

    const dsls = useMemo(() => {
        return [
            dataSet && dataSetDsl,
            sensors && sensorsDsl,
            dataDsl,
            dataVar && dataVarDsl,
            chart && chartDsl,
            fieldsDsl,
            createIFrameDSL("host", "*"),
        ].filter(dsl => !!dsl)
    }, [])

    return (
        <NoSsr>
            <BlockProvider storageKey={DS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <DSEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
