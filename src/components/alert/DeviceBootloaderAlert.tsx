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
            Bootloader mode{" "}
            <DeviceResetButton device={device} showLabel={true} />
        </Alert>
    )
}
