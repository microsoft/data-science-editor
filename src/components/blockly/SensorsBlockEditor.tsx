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
import useFileSystem from "../FileSystemContext"
import { createIFrameDSL } from "./dsl/iframedsl"
import { useLocationSearchParamBoolean } from "../hooks/useLocationSearchParam"
import dataVarDsl from "./dsl/datavardsl"
import sensorsDSL from "./dsl/sensorsdsl"
import dataSetDsl from "./dsl/datasetdsl"
import ServiceChips from "./ServiceChips"

const SENSORS_EDITOR_ID = "sensors"
const SENSORS_SOURCE_STORAGE_KEY = "tools:sensoreditor"
const SENSORS_NEW_FILE_CONTENT = JSON.stringify({
    editor: SENSORS_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function SensorsEditorWithContext() {
    const { fileSystem } = useFileSystem()

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <ServiceChips />
            </Grid>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={SENSORS_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockEditor />
            </Grid>
            {Flags.diagnostics && <BlockDiagnostics />}
        </Grid>
    )
}

export default function DSBlockEditor() {
    const sensors = useLocationSearchParamBoolean("sensors", true)
    const dataSet = useLocationSearchParamBoolean("dataset", true)
    const dataVar = useLocationSearchParamBoolean("datavar", true)
    const chart = useLocationSearchParamBoolean("chart", true)

    const dsls = useMemo(() => {
        return [
            dataSet && dataSetDsl,
            sensors && sensorsDSL,
            dataDsl,
            dataVar && dataVarDsl,
            chart && chartDsl,
            fieldsDsl,
            createIFrameDSL("host", "*"),
        ].filter(dsl => !!dsl)
    }, [])

    return (
        <NoSsr>
            <BlockProvider editorId={SENSORS_EDITOR_ID} storageKey={SENSORS_SOURCE_STORAGE_KEY} dsls={dsls}>
                <SensorsEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
