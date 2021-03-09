// tslint:disable-next-line: no-submodule-imports
import { Box, createStyles, makeStyles } from "@material-ui/core";
// tslint:disable-next-line: no-submodule-imports
import Alert from "../ui/Alert";
import React, { useContext } from "react";
import { BusState } from "../../../jacdac-ts/src/jdom/bus";
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec";
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import ConnectButton from "../../jacdac/ConnectButton";
import { isWebUSBEnabled, isWebUSBSupported } from "../../../jacdac-ts/src/jdom/usb"
import { NoSsr } from '@material-ui/core';
import useChange from "../../jacdac/useChange";

const useStyles = makeStyles((theme) => createStyles({
    button: {
        marginLeft: theme.spacing(2)
    }
}))

function NoSsrConnectAlert(props: { serviceClass?: number }) {
    const classes = useStyles()
    const { bus, connectionState } = useContext<JacdacContextProps>(JacdacContext)
    const { serviceClass } = props
    const devices = useChange(bus, b => b.devices({ serviceClass }))
    const spec = serviceSpecificationFromClassIdentifier(serviceClass)
    const webusb = isWebUSBEnabled() && isWebUSBSupported()

    if (!devices?.length &&
        webusb &&
        connectionState === BusState.Disconnected)
        return <Box displayPrint="none">
            <Alert severity="info" closeable={true}>
                {!spec && <span>Did you connect your device?</span>}
                {spec && <span>Did you connect a {spec.name} device?</span>}
                <ConnectButton className={classes.button} full={true} transparent={true} />
            </Alert>
        </Box>
    return null
}

export default function ConnectAlert(props: { serviceClass?: number }) {
    return <NoSsr>
        <NoSsrConnectAlert {...props} />
    </NoSsr>
}