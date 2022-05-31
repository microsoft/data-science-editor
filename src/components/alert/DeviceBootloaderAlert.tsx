import { AlertTitle } from "@mui/material"
import React from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import DeviceResetButton from "../devices/DeviceResetButton"
import Alert from "../ui/Alert"

export default function DeviceBootloaderAlert(props: { device: JDDevice }) {
    const { device } = props
    const bootloader = useChange(device, _ => _?.bootloader)
    if (!bootloader) return null
    return (
        <Alert severity="info">
            <AlertTitle>Bootloader mode</AlertTitle>
            This mode is used to update your device firmware. To go back in
            Application mode, press the <b>RESET</b> button.
            <DeviceResetButton device={device} showLabel={true} />
        </Alert>
    )
}
