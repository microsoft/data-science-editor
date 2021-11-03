import { Box, NoSsr, Paper } from "@mui/material"
import React from "react"
import ConsoleLog from "./ConsoleLog"
import ConsoleToolbar from "./ConsoleToolbar"

/** Delay load */
export default function Console() {
    return (
        <NoSsr>
            <Paper square elevation={1}>
                <Box display="flex">
                    <ConsoleToolbar />
                </Box>
            </Paper>
            <ConsoleLog />
        </NoSsr>
    )
}
