import React, { useMemo } from "react";
import { parseTrace } from "../../../jacdac-ts/src/jdom/logparser";
import TraceView from "./TraceView";

export default function TraceSnippet(props: { source: string }) {
    const { source } = props;
    const trace = useMemo(() => parseTrace(source), [source])
    return <TraceView trace={trace} />
}