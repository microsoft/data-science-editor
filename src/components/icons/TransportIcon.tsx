import React from "react"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import UsbIcon from "@material-ui/icons/Usb"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import BluetoothIcon from "@material-ui/icons/Bluetooth"
import {
    BLUETOOTH_TRANSPORT,
    PACKETIO_TRANSPORT,
    USB_TRANSPORT,
    VIRTUAL_DEVICE_NODE_NAME,
} from "../../../jacdac-ts/src/jdom/constants"
import KindIcon from "../KindIcon"

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
        default:
            return (
                <KindIcon
                    kind={VIRTUAL_DEVICE_NODE_NAME}
                    className={className}
                />
            )
    }
}
