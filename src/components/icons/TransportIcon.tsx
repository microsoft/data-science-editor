import React from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import UsbIcon from "@material-ui/icons/Usb"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BluetoothIcon from "@material-ui/icons/Bluetooth"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import WifiIcon from "@material-ui/icons/Wifi"
import {
    BLUETOOTH_TRANSPORT,
    PACKETIO_TRANSPORT,
    SERIAL_TRANSPORT,
    USB_TRANSPORT,
    WEBSOCKET_TRANSPORT,
    VIRTUAL_DEVICE_NODE_NAME,
} from "../../../jacdac-ts/src/jdom/constants"
import KindIcon from "../KindIcon"
import SerialIcon from "./SerialIcon"

export default function TransportIcon(props: {
    type: string
    className?: string
}) {
    const { type, className } = props
    switch (type) {
        case PACKETIO_TRANSPORT:
        case USB_TRANSPORT:
            return <UsbIcon className={className} />
        case BLUETOOTH_TRANSPORT:
            return <BluetoothIcon className={className} />
        case SERIAL_TRANSPORT:
            return <SerialIcon className={className} />
        case WEBSOCKET_TRANSPORT:
            return <WifiIcon className={className} />
        default:
            return (
                <KindIcon
                    kind={VIRTUAL_DEVICE_NODE_NAME}
                    className={className}
                />
            )
    }
}
