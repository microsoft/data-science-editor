import React, { useContext, useState } from "react"
import HighlightTextField from "../ui/HighlightTextField"
import useDeviceScript from "./DeviceScriptContext"
import BrainManagerContext from "../brains/BrainManagerContext"
import useBrainScript from "../brains/useBrainScript"
import useEffectAsync from "../useEffectAsync"
import useDeviceScriptVm from "./useDeviceScriptVm"

export default function DeviceScriptTextField(props: {
    minHeight?: string
    maxHeight?: string
}) {
    const { minHeight = "4rem", maxHeight = "12rem" } = props
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
        <HighlightTextField
            code={source || ""}
            language="typescript"
            onChange={setSource}
            annotations={annotations}
            disabled={loading}
            minHeight={minHeight}
            maxHeight={maxHeight}
        />
    )
}
