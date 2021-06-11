import React from "react"
import ReactMarkdown from "react-markdown"
import {
    NormalComponents,
    SpecialComponents,
} from "react-markdown/src/ast-to-react"

export default function Markdown(props: {
    source: string
    className?: string
    components?: Partial<NormalComponents | SpecialComponents>
}) {
    const { source, ...others } = props
    return <ReactMarkdown {...others}>{source}</ReactMarkdown>
}
