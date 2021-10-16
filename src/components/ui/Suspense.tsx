import { NoSsr } from "@material-ui/core"
import React, { ReactNode, Suspense as ReactSuspense } from "react"
import Progress from "./Progress"

export default function Suspense(props: { children: ReactNode }) {
    const { children } = props
    return (
        <NoSsr>
            <ReactSuspense
                fallback={
                    <Progress>
                        <span></span>
                    </Progress>
                }
            >
                {children}
            </ReactSuspense>
        </NoSsr>
    )
}
