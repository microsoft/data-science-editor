import React, { useContext } from "react"
import PacketsContext from "../PacketsContext"

export default function TraceAnalyzer() {
    const { replayTrace } = useContext(PacketsContext)

    return <>
        {replayTrace && <pre>
            {replayTrace.serializeToText()}
        </pre>}
    </>
}