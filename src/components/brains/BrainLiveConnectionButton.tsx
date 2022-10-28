import React, { useContext } from "react"
import { BrainDevice } from "./braindom"
import BrainManagerContext from "./BrainManagerContext"
import ScreenShareIcon from "@mui/icons-material/ScreenShare"
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare"
import CmdButton from "../CmdButton"
import useChange from "../../jacdac/useChange"
import useBus from "../../jacdac/useBus"

export default function BrainLiveConnectionButton(props: {
    brain: BrainDevice
}) {
    const { brain } = props
    const { liveDeviceId, connectLiveDevice } = useContext(BrainManagerContext)
    const { deviceId } = brain
    const bus = useBus()
    const device = useChange(bus, _ => _?.device(deviceId), [deviceId])
    const connected = useChange(brain, _ => _.connected)
    const selected = liveDeviceId === deviceId
    const disabled = !connected && !device && !selected

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
