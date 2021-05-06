import React from "react"
import ReactMarkdown from "react-markdown"

export default function Markdown(props: {
    source: string
    className?: string
}) {
    const { source, ...others } = props
    return <ReactMarkdown {...others}>{source}</ReactMarkdown>
}
