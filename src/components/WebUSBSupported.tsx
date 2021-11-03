import React, { ReactNode } from "react"
import {
    isWebUSBEnabled,
    isWebUSBSupported,
} from "../../jacdac-ts/src/jdom/transport/usb"

export default function WebUSBSupported(props: { children: ReactNode }) {
    const { children } = props
    return <>{isWebUSBEnabled() && isWebUSBSupported() && children}</>
}
