import React from "react"
import TraceAnalyzer from "../../components/trace/TraceAnalyzer"

export const frontmatter = {
    title: "Trace Player",
    description: "Replay a packet trace.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />


export default function Page() {
    return <TraceAnalyzer />
}
