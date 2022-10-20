import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import CmdButton from "../CmdButton"
import RestartAltIcon from "@mui/icons-material/RestartAlt"

export default function DeviceResetButton(props: {
    device: JDDevice
    showLabel?: boolean
}) {
    const { device, showLabel } = props
    const handleReset = async () => await device.reset()
    return (
        <CmdButton
            disabled={!device}
            trackName="device.reset"
            size="small"
            title="reset"
            onClick={handleReset}
            icon={<RestartAltIcon />}
        >
            {showLabel ? "Reset" : null}
        </CmdButton>
    )
}
