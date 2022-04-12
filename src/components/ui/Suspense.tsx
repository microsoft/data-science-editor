import { NoSsr } from "@mui/material"
import React, { ReactNode, Suspense as ReactSuspense } from "react"
import Progress from "./Progress"

export default function Suspense(props: {
    children: ReactNode
    fallback?: React.ReactNode
}) {
    const { children, fallback } = props
    return (
        <NoSsr>
            <ReactSuspense
                fallback={
                    fallback != undefined ? (
                        fallback
                    ) : (
                        <Progress>
                            <span></span>
                        </Progress>
                    )
                }
            >
                {children}
            </ReactSuspense>
        </NoSsr>
    )
}
