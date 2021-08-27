import React, { lazy } from "react"
import Suspense from "./Suspense"
const ReactMarkdown = lazy(() => import("react-markdown"))

export default function Markdown(props: {
    source: string
    className?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components?: Partial<any>
}) {
    const { source, ...others } = props
    return (
        <Suspense>
            <ReactMarkdown {...others}>{source}</ReactMarkdown>
        </Suspense>
    )
}
