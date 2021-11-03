import { Typography } from "@mui/material"
import React, { useContext } from "react"
import PacketsContext from "./PacketsContext"
import TraceImportButton from "./trace/TraceImportButton"
import TraceSaveButton from "./trace/TraceSaveButton"
import TraceRecordButton from "./trace/TraceRecordButton"
import TracePlayButton from "./trace/TracePlayButton"
import TraceClearButton from "./trace/TraceClearButton"

export default function PacketRecorder() {
    const { replayTrace, recording, tracing } = useContext(PacketsContext)

    return (
        <>
            {!recording && replayTrace && (
                <Typography variant="caption">
                    {replayTrace.packets.length} packets
                </Typography>
            )}
            <TraceImportButton icon={true} disabled={tracing || recording} />
            <TraceSaveButton />
            |
            <TraceRecordButton size="small" />
            <TracePlayButton size="small" />
            <TraceClearButton size="small" />
        </>
    )
}
