import React from "react"
import Flags from "../../jacdac-ts/src/jdom/flags";
import { isWebUSBEnabled, isWebUSBSupported } from "../../jacdac-ts/src/jdom/usb"

export default function WebUSBSupported(props: { children: ReactNode }) {
    const { children } = props;
    return <>
        {isWebUSBEnabled() && isWebUSBSupported() && children}
    </>
}