import React from "react"
import ReactMarkdown from 'react-markdown'

export default function Markdown(props: { source: string, className?: string }) {
    return <ReactMarkdown {...props} />
}