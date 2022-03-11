import React from "react"
import {
    LOST,
    FOUND,
    SRV_BOOTLOADER,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import useEventRaised from "../../jacdac/useEventRaised"
import Alert from "../ui/Alert"

export function DeviceLostAlert(props: { device: JDDevice }) {
    const { device } = props
    const lost = useEventRaised([LOST, FOUND], device, dev => !!dev?.lost)
    const flashing = useChange(
        device,
        _ => _?.hasService(SRV_BOOTLOADER) || !!_?.firmwareUpdater
    )
    if (!lost || flashing) return null
    return <Alert severity="info">Device lost...</Alert>
}
