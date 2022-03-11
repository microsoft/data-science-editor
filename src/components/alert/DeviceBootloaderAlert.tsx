import React from "react"
import { SRV_BOOTLOADER } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import DeviceResetButton from "../devices/DeviceResetButton"
import Alert from "../ui/Alert"

export function DeviceBootloaderAlert(props: { device: JDDevice }) {
    const { device } = props
    const bootloader = useChange(device, _ => _?.hasService(SRV_BOOTLOADER))
    if (!bootloader) return null
    return (
        <Alert severity="info">
            Bootloader mode <DeviceResetButton device={device} />
        </Alert>
    )
}
