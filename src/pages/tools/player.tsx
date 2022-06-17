import React from "react"
import TraceAnalyzer from "../../components/trace/TraceAnalyzer"

export const frontmatter = {
    title: "Trace Player",
    description: "Replay a packet trace.",
}


export default function Page() {
    return <TraceAnalyzer />
}
