import { Tooltip } from "@mui/material"
import React from "react"

export default function OptionalTooltip(props: {
    children: JSX.Element
    title: string
}) {
    const { children, title } = props
    if (!title) return children
    return (
        <Tooltip title={title}>
            <div>{children}</div>
        </Tooltip>
    )
}
