import React, { useMemo } from "react"
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser"
import TraceView from "./TraceView"

export default function TraceSnippet(props: { source: string }) {
    const { source } = props
    // TODO get bus from somewhere?
    const packets = useMemo(() => parseTrace(source).toPackets(), [source])
    return <TraceView packets={packets} />
}
