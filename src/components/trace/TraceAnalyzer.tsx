import React, { useCallback, useContext } from "react"
import PacketsContext from "../PacketsContext"
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser"
import useWindowPaste from "../hooks/useWindowPaste"
import { Link } from "gatsby-theme-material-ui"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import { Container } from "@mui/material"

export default function TraceAnalyzer() {
    const bus = useBus()
    const { replayTrace, setReplayTrace } = useContext(PacketsContext)
    const importTrace = useCallback(
        (text: string) => {
            const trace = parseTrace(text)
            setReplayTrace(trace)
        },
        [setReplayTrace]
    )
    useWindowPaste(importTrace)
    const traceText = useChange(
        bus,
        bus => {
            if (bus) replayTrace?.resolveDevices(bus)
            return replayTrace?.serializeToText()
        },
        [replayTrace]
    )

    if (!traceText)
        return (
            <Container>
                <p>
                    No trace loaded.{" "}
                    <Link to="/tools/traces">
                        Learn how to collect a trace.
                    </Link>
                </p>
            </Container>
        )

    return <pre>{traceText}</pre>
}
