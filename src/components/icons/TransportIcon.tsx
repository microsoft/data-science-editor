import React from "react"
import { JDTransport } from "../../../jacdac-ts/src/jdom/transport"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import UsbIcon from "@material-ui/icons/Usb"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BluetoothIcon from "@material-ui/icons/Bluetooth"
import { BLE_TRANSPORT, USB_TRANSPORT } from "../../../jacdac-ts/src/jdom/constants"

export default function TransportIcon(props: { transport: JDTransport }) {
    const { transport } = props
    const { type } = transport

    return (
        <>
            {type === USB_TRANSPORT && <UsbIcon />}
            {type === BLE_TRANSPORT && <BluetoothIcon />}
        </>
    )
}
