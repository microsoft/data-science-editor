import { Box, BoxProps, Paper, useTheme } from "@mui/material"
import React from "react"

export default function PaperBox(
    props: { padding?: number; elevation?: number; bgcolor?: string } & BoxProps
) {
    const { children, padding, elevation, bgcolor, ...others } = props
    const theme = useTheme()

    return (
        <Box {...others} bgcolor={bgcolor} mb={theme.spacing(0.25)}>
            <Paper square elevation={elevation}>
                {padding !== 0 && (
                    <Box p={theme.spacing(padding || 0.25)}>{children}</Box>
                )}
                {padding === 0 && children}
            </Paper>
        </Box>
    )
}
