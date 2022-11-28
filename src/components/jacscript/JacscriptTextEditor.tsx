import React, { useContext, useEffect, useState, lazy } from "react"
import { Grid, NoSsr } from "@mui/material"
import HighlightTextField from "../ui/HighlightTextField"
import useJacscript from "./JacscriptContext"
import { useDebounce } from "use-debounce"
import BrainManagerToolbar from "../brains/BrainManagerToolbar"
import BrainManagerContext from "../brains/BrainManagerContext"
import useBrainScript from "../brains/useBrainScript"
import useEffectAsync from "../useEffectAsync"
import Suspense from "../ui/Suspense"
import useJacscriptVm from "./useJacscriptVm"
import JacscriptToolbar from "./JacscriptToolbar"
const Dashboard = lazy(() => import("../dashboard/Dashboard"))

function JacscriptTextEditorWithContext() {
    const { setSource: setJscSource, compiled } = useJacscript()
    const { scriptId } = useContext(BrainManagerContext)
    const script = useBrainScript(scriptId)
    const [source, setSource] = useState("")
    const [loading, setLoading] = useState(false)
    const [debouncedSource] = useDebounce(source, 1000)

    useJacscriptVm()

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

    // debounced text buffer UI
    useEffect(() => {
        setJscSource(debouncedSource)
    }, [debouncedSource])

    const annotations = compiled?.errors?.map(
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
                <JacscriptToolbar />
            </Grid>
            <Grid item xs={12}>
                <HighlightTextField
                    code={source}
                    language={"javascript"}
                    onChange={setSource}
                    annotations={annotations}
                    disabled={loading}
                />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <Dashboard
                        showAvatar={true}
                        showHeader={true}
                        showConnect={false}
                        showStartSimulators={true}
                        showStartRoleSimulators={true}
                        showDeviceProxyAlert={true}
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}

export default function JacscriptTextEditor() {
    return (
        <NoSsr>
            <JacscriptTextEditorWithContext />
        </NoSsr>
    )
}
