import { Typography } from "@mui/material"
import React, { useContext } from "react"
import PacketsContext from "../PacketsContext"
import TraceClearButton from "../trace/TraceClearButton"
import TracePlayButton from "../trace/TracePlayButton"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"

export default function TraceAlert() {
    const { recording, replayTrace } = useContext(PacketsContext)
    if (!replayTrace) return null

    return (
        <Alert severity="success">
            <AlertTitle>Trace replay mode</AlertTitle>
            <TracePlayButton size="small" color="inherit" />
            <TraceClearButton size="small" color="inherit" />
            {!recording && replayTrace && (
                <Typography variant="caption">
                    {replayTrace.packets.length} packets, clear to resume live
                    data.
                </Typography>
            )}
        </Alert>
    )
}
