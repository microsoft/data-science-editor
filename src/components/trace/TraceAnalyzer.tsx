import React, { useCallback, useContext } from "react"
import PacketsContext from "../PacketsContext"
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser"
import useWindowPaste from "../hooks/useWindowPaste"
import { Link } from "gatsby-theme-material-ui"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function TraceAnalyzer() {
    const bus = useBus();
    const { replayTrace, setReplayTrace } = useContext(PacketsContext)
    const importTrace = useCallback(
        (text: string) => {
            const trace = parseTrace(text)
            setReplayTrace(trace)
        },
        [setReplayTrace]
    )
    useWindowPaste(importTrace)
    const traceText = useChange(bus, _ => {
        if (_)
            replayTrace?.resolveDevices(_);
        return replayTrace?.serializeToText()
    }, [replayTrace])

    if (!traceText)
        return <p>
            No trace loaded. <Link to="/software/traces">Learn how to collect a trace.</Link>
        </p>

    return <pre>{traceText}</pre>
}
