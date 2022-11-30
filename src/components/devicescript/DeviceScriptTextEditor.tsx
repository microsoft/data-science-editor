import React, { useContext, useState, lazy } from "react"
import { Grid, NoSsr } from "@mui/material"
import HighlightTextField from "../ui/HighlightTextField"
import useDeviceScript from "./DeviceScriptContext"
import BrainManagerToolbar from "../brains/BrainManagerToolbar"
import BrainManagerContext from "../brains/BrainManagerContext"
import useBrainScript from "../brains/useBrainScript"
import useEffectAsync from "../useEffectAsync"
import Suspense from "../ui/Suspense"
import useDeviceScriptVm from "./useDeviceScriptVm"
import DeviceScriptToolbar from "./DeviceScriptToolbar"
import GridHeader from "../ui/GridHeader"
const Console = lazy(() => import("../console/Console"))
const Dashboard = lazy(() => import("../dashboard/Dashboard"))

function DeviceScriptTextEditorWithContext() {
    const { source, setSource, compiled } = useDeviceScript()
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
    const [loading, setLoading] = useState(false)

    useDeviceScriptVm()

    // load script
    useEffectAsync(async () => {
        if (!script) {
            setSource("")
            return
        }

        // fetch latest body
        setLoading(true)
        try {
            await script.refreshBody()
            const { text } = script.body || {}
            setSource(text || "")
        } finally {
            setLoading(false)
        }
    }, [script?.id])

    const annotations = compiled?.errors?.slice(0, 1)?.map(
        error =>
            ({
                file: error.filename,
                line: error.line,
                message: error.message,
            } as jdspec.Diagnostic)
    )

    return (
        <Grid spacing={1} container>
            {script && (
                <Grid item xs={12}>
                    <BrainManagerToolbar script={script} />
                </Grid>
            )}
            <Grid item xs={12}>
                <DeviceScriptToolbar />
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source || ""}
                    language={"javascript"}
                    onChange={setSource}
                    annotations={annotations}
                    disabled={loading}
                    minHeight="4rem"
                    maxHeight="12rem"
                />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Dashboard
                        showAvatar={true}
                        showHeader={true}
                        showConnect={false}
                        showStartSimulators={false}
                        showStartRoleSimulators={true}
                        showDeviceProxyAlert={true}
                    />
                </Suspense>
            </Grid>
            <Grid item xs={12}>
                <GridHeader title="Console" />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Console
                        showToolbar={true}
                        showFiles={false}
                        showLevel={true}
                        showPopout={false}
                        showSerial={true}
                        height="10rem"
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}

export default function DeviceScriptTextEditor() {
    return (
        <NoSsr>
            <DeviceScriptTextEditorWithContext />
        </NoSsr>
    )
}
