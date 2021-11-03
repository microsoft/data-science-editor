import React, { ReactNode } from "react"
import { Box, Paper, useTheme } from "@mui/material"

export default function Widget(props: { children: ReactNode }) {
    const { children } = props
    const theme = useTheme()
    return (
        <Paper>
            <Box mx={1} p={theme.spacing(0.5)}>
                {children}
            </Box>
        </Paper>
    )
}
