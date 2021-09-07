import { Typography } from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@material-ui/icons/Clear"
import React, { useContext } from "react"
import PacketsContext from "./PacketsContext"
import TraceImportButton from "./trace/TraceImportButton"
import TraceSaveButton from "./trace/TraceSaveButton"
import TraceRecordButton from "./trace/TraceRecordButton"
import TracePlayButton from "./trace/TracePlayButton"
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ReplayIcon from "@material-ui/icons/Replay"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PauseIcon from "@material-ui/icons/Pause"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LiveTvIcon from "@material-ui/icons/LiveTv"
import TraceClearButton from "./trace/TraceClearButton"

export default function PacketRecorder() {
    const {
        clearPackets,
        clearBus,
        replayTrace,
        recording,
        tracing,
        paused,
        setPaused,
    } = useContext(PacketsContext)

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
            <TraceClearButton size="small" />|
            <IconButtonWithTooltip
                trackName={`recorder.${paused ? "resume" : "pause"}`}
                title={paused ? "Resume packets" : "pause packets"}
                size="small"
                key="pausepackets"
                onClick={() => setPaused(!paused)}
            >
                {paused ? <LiveTvIcon /> : <PauseIcon />}
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName={`recorder.packets.clear`}
                title="Clear Packets"
                size="small"
                key="clearpackets"
                onClick={clearPackets}
                disabled={recording || tracing}
            >
                <ClearIcon />
            </IconButtonWithTooltip>
            <IconButtonWithTooltip
                trackName={`recorder.bus.clear`}
                title="Clear Devices"
                size="small"
                key="clearbus"
                onClick={clearBus}
                disabled={recording || tracing}
            >
                <ReplayIcon />
            </IconButtonWithTooltip>
        </>
    )
}
