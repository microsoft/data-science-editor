import React from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import UsbIcon from "@material-ui/icons/Usb"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BluetoothIcon from "@material-ui/icons/Bluetooth"
import {
    BLUETOOTH_TRANSPORT,
    PACKETIO_TRANSPORT,
    USB_TRANSPORT,
} from "../../../jacdac-ts/src/jdom/constants"

export default function TransportIcon(props: { type: string }) {
    const { type } = props

    return (
        <>
            {type === USB_TRANSPORT && <UsbIcon />}
            {type === BLUETOOTH_TRANSPORT && <BluetoothIcon />}
            {type === PACKETIO_TRANSPORT && <UsbIcon />}
        </>
    )
}
