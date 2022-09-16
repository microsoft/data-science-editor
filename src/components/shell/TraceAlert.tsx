import { Typography } from "@mui/material"
import React, { useContext } from "react"
import PacketsContext from "../PacketsContext"
import TraceClearButton from "../trace/TraceClearButton"
import TracePlayButton from "../trace/TracePlayButton"
import Alert from "../ui/Alert"
import { AlertTitle } from "@mui/material"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import TextSnippetIcon from '@mui/icons-material/TextSnippet';

export default function TraceAlert() {
    const { recording, replayTrace } = useContext(PacketsContext)
    if (!replayTrace) return null

    return (
        <Alert severity="success">
            <AlertTitle>Trace replay mode</AlertTitle>
            <TracePlayButton size="small" color="inherit" />
            <TraceClearButton size="small" color="inherit" />
            <IconButtonWithTooltip size="small" color="inherit" to="/tools/player/" title="Open Trace Analyzer">
                <TextSnippetIcon/>
            </IconButtonWithTooltip>
            {!recording && replayTrace && (
                <Typography variant="caption">
                    {replayTrace.frames.length} packets, clear to resume live
                    data.
                </Typography>
            )}
        </Alert>
    )
}
