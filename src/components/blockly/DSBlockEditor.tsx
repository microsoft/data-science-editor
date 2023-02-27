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
import useFileSystem from "../fs/FileSystemContext"
import { createIFrameDSL } from "./dsl/iframedsl"
import {
    useLocationSearchParamBoolean,
    useLocationSearchParamString,
} from "../hooks/useLocationSearchParam"
import dataSetDsl from "./dsl/datasetdsl"
import dataVarDsl from "./dsl/datavardsl"
import useChange from "../dom/useChange"
import { UIFlags } from "../uiflags"
import SplashDialog from "../ui/SplashDialog"
import visualizeDsl from "./dsl/visualizedsl"
import statsDsl from "./dsl/statsdsl"

const DS_EDITOR_ID = "ds"
const DS_SOURCE_STORAGE_KEY = "editor"
const DS_NEW_FILE_CONTENT = JSON.stringify({
    editor: DS_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function DSEditorWithContext() {
    const { fileSystem } = useFileSystem()
    const root = useChange(fileSystem, _ => _?.root)

    return (
        <Grid container direction="column" spacing={1}>
            {!!root && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={DS_NEW_FILE_CONTENT}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockEditor className={root ? "fs" : ""} />
            </Grid>
        </Grid>
    )
}

/**
 * Data science block editor component
 */
export default function DSBlockEditor() {
    // read url search flags
    const dataSet = useLocationSearchParamBoolean("dataset", true)
    const dataVar = useLocationSearchParamBoolean("datavar", true)
    const visualize = useLocationSearchParamBoolean("visualize", true)
    const statistics = useLocationSearchParamBoolean("statistics", true)
    const chart = useLocationSearchParamBoolean("chart", true)
    const host = UIFlags.hosted
    const targetOrigin = useLocationSearchParamString("targetorigin") || "*"

    const dsls = useMemo(() => {
        return [
            dataSet && dataSetDsl,
            dataDsl,
            visualize && visualizeDsl,
            statistics && statsDsl,
            dataVar && dataVarDsl,
            chart && chartDsl,
            fieldsDsl,
            // host is used to comms with excel
            host && createIFrameDSL("host", targetOrigin),
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
                <SplashDialog />
            </BlockProvider>
        </NoSsr>
    )
}
