import { BoxProps, Paper } from "@mui/material"
import React from "react"

export default function PaperBox(
    props: { padding?: number; elevation?: number; bgcolor?: string } & BoxProps
) {
    const { children, padding = 1, elevation = 1, bgcolor, ...others } = props
    return (
        <Paper
            sx={{ mb: 1, bgcolor, p: padding, ...others }}
            square
            elevation={elevation}
        >
            {children}
        </Paper>
    )
}
