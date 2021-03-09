import React, { } from "react"
import { isWebUSBEnabled, isWebUSBSupported } from "../../../jacdac-ts/src/jdom/usb"
import { NoSsr } from '@material-ui/core';
// tslint:disable-next-line: no-submodule-imports
import Alert from "../ui/Alert";
import { Link } from "gatsby-theme-material-ui";

function NoSsrAlert() {
    const enabled = isWebUSBEnabled();
    const supported = isWebUSBSupported()
    return <>
        {enabled && !supported &&
            <Alert closeable={true} severity="info">
                Use a browser that supports <Link to="https://caniuse.com/#feat=webusb">WebUSB</Link> to connect to Jacdac devices.
            </Alert>}
    </>
}

export default function WebUSBAlert() {
    return <NoSsr>
        <NoSsrAlert />
    </NoSsr>
}