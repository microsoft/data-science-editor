import React, { useMemo } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from 'remark-gfm'

export default function SuspensedMarkdown(props: {
    source: string
    className?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components?: Partial<any>
}) {
    const { source, ...others } = props
    const remarkPlugins = useMemo(() => [remarkGfm], []);
    return <ReactMarkdown {...others} remarkPlugins={remarkPlugins}>{source}</ReactMarkdown>
}
