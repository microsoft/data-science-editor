// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ClearIcon from "@material-ui/icons/Clear"
import React, { useContext } from "react"
import PacketsContext from "./PacketsContext"

import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ReplayIcon from "@material-ui/icons/Replay"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PauseIcon from "@material-ui/icons/Pause"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import LiveTvIcon from "@material-ui/icons/LiveTv"

export default function PacketControlButtons() {
    const { clearPackets, clearBus, recording, tracing, paused, setPaused } =
        useContext(PacketsContext)

    return (
        <>
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
