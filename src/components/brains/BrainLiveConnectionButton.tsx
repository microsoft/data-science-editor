import React, { useContext } from "react"
import { BrainDevice } from "./braindom"
import BrainManagerContext from "./BrainManagerContext"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import CmdButton from "../CmdButton"
import useChange from "../../jacdac/useChange"

export default function BrainLiveConnectionButton(props: {
    brain: BrainDevice
}) {
    const { brain } = props
    const { liveDeviceId, connectLiveDevice } = useContext(BrainManagerContext)
    const { deviceId } = brain
    const connected = useChange(brain, _ => _.connected)
    const selected = liveDeviceId === deviceId
    const disabled = !connected

    const handleClick = () => connectLiveDevice(selected ? "" : deviceId)

    return (
        <CmdButton
            title={selected ? "disconnect live" : "connect live"}
            onClick={handleClick}
            disabled={disabled}
            icon={selected ? <StopScreenShareIcon /> : <ScreenShareIcon />}
        />
    )
}
