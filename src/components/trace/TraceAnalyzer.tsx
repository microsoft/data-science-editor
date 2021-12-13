import React, { useCallback, useContext } from "react"
import PacketsContext from "../PacketsContext"
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser"
import useWindowPaste from "../hooks/useWindowPaste"
import PacketList from "../PacketList"

export default function TraceAnalyzer() {
    const { replayTrace, setReplayTrace } = useContext(PacketsContext)
    const importTrace = useCallback(
        (text: string) => {
            const trace = parseTrace(text)
            setReplayTrace(trace)
        },
        [setReplayTrace]
    )
    useWindowPaste(importTrace)

    if (!replayTrace) return null

    return (
        <>
            <PacketList
                packets={replayTrace.packets}
                showTime={true}
                showRaw={true}
            />
            <pre>{replayTrace.serializeToText()}</pre>
        </>
    )
}
