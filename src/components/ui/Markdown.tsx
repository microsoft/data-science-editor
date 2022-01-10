import React, { lazy } from "react"
import Suspense from "./Suspense"
const SuspensedMarkdown = lazy(() => import("./SuspensedMarkdown"))

export default function Markdown(props: {
    source: string
    className?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    components?: Partial<any>
}) {
    return (
        <Suspense>
            <SuspensedMarkdown {...props} />
        </Suspense>
    )
}
