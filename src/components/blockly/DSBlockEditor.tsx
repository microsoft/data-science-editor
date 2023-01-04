import { Grid, NoSsr } from "@mui/material"
import React, { useMemo } from "react"
import { BlockProvider } from "./BlockContext"
import BlockEditor from "./BlockEditor"
import FileTabs from "../fs/FileTabs"
import { WorkspaceFile } from "./dsl/workspacejson"
import dataDsl from "./dsl/datadsl"
import chartDsl from "./dsl/chartdsl"
import fieldsDsl from "./dsl/fieldsdsl"
import { WORKSPACE_FILENAME } from "./toolbox"
import useFileSystem from "../FileSystemContext"
import { createIFrameDSL } from "./dsl/iframedsl"
import {
    useLocationSearchParamBoolean,
    useLocationSearchParamString,
} from "../hooks/useLocationSearchParam"
import dataSetDsl from "./dsl/datasetdsl"
import dataVarDsl from "./dsl/datavardsl"
import { UIFlags } from "../dom/providerbus"

const DS_EDITOR_ID = "ds"
const DS_SOURCE_STORAGE_KEY = "tools:dseditor"
const DS_NEW_FILE_CONTENT = JSON.stringify({
    editor: DS_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function DSEditorWithContext() {
    const { fileSystem } = useFileSystem()

    return (
        <Grid container direction="column" spacing={1}>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={DS_NEW_FILE_CONTENT}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockEditor />
            </Grid>
        </Grid>
    )
}

export default function DSBlockEditor() {
    const dataSet = useLocationSearchParamBoolean("dataset", true)
    const dataVar = useLocationSearchParamBoolean("datavar", true)
    const chart = useLocationSearchParamBoolean("chart", true)
    const host = useLocationSearchParamString("host")

    const dsls = useMemo(() => {
        return [
            dataSet && dataSetDsl,
            dataDsl,
            dataVar && dataVarDsl,
            chart && chartDsl,
            fieldsDsl,
            host && createIFrameDSL("host", host),
        ].filter(dsl => !!dsl)
    }, [])

    return (
        <NoSsr>
            <BlockProvider
                editorId={DS_EDITOR_ID}
                storageKey={DS_SOURCE_STORAGE_KEY}
                dsls={dsls}
            >
                <DSEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
