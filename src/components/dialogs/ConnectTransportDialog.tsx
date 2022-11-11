import {
    Card,
    CardActions,
    CardContent,
    CardHeader,
    Dialog,
    DialogContent,
    Grid,
    Typography,
} from "@mui/material"
import React, { useContext } from "react"
import { useId } from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ConnectButton from "../buttons/ConnectButton"
import useDeviceImage from "../devices/useDeviceImage"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import { Transport } from "../../../jacdac-ts/src/jdom/transport/transport"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import GridHeader from "../ui/GridHeader"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import { Link } from "gatsby-theme-material-ui"
import useGridBreakpoints from "../useGridBreakpoints"
import { useDeviceSpecificationFromProductIdentifier } from "../../jacdac/useDeviceSpecification"

function ConnectDeviceCard(props: { device: jdspec.DeviceSpec }) {
    const { device } = props
    const { name, firmwares, productIdentifiers } = device
    const firmware = firmwares?.[0]
    const image = useDeviceImage(device, "preview")
    const deviceSpec = useDeviceSpecificationFromProductIdentifier(
        productIdentifiers?.[0]
    )
    const requestDescription = deviceSpec?.transport?.requestDescription
    return (
        <Card>
            <img
                src={image}
                style={{ aspectRatio: "4 / 3", width: "100%" }}
                alt={`photograph of ${name}`}
                loading="lazy"
            />
            <CardHeader title={name} subheader={requestDescription} />
            {!!firmware && (
                <CardActions>
                    <Link
                        variant="caption"
                        color="inherit"
                        href={firmware.url}
                        title="Download firwmare to connect Jacdac devices"
                    >
                        Download firmware
                    </Link>
                </CardActions>
            )}
        </Card>
    )
}

function ConnectTransport(props: {
    transport: Transport
    onClose: () => void
}) {
    const { transport, onClose } = props
    const { type: transportType } = transport
    const devices = useDeviceSpecifications({ transport: transportType })
    const breakpoints = useGridBreakpoints(devices?.length)
    if (!devices?.length && !Flags.diagnostics) return null
    return (
        <>
            <GridHeader title={transport.type.toUpperCase()} />
            {devices.map(device => (
                <Grid item {...breakpoints} key={device.id}>
                    <ConnectDeviceCard device={device} />
                </Grid>
            ))}
            <Grid item xs={12} textAlign="right">
                <ConnectButton
                    key={transport.type}
                    transport={transport}
                    onClick={onClose}
                    full={true}
                    typeInTitle={true}
                />
            </Grid>
        </>
    )
}

export default function ConnectTransportDialog(props: {
    open: boolean
    onClose: () => void
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    const { open, onClose } = props
    const dialogId = useId()
    const labelId = dialogId + "-label"
    return (
        <Dialog
            id={dialogId}
            aria-labelledby={labelId}
            open={open}
            onClose={onClose}
            fullWidth={true}
        >
            <DialogTitleWithClose onClose={onClose} id={labelId}>
                Connect to a device
            </DialogTitleWithClose>
            <DialogContent>
                <Typography variant="caption">
                    Find your device connection type and connect.
                </Typography>
                <Grid container spacing={2}>
                    {transports.map(transport => (
                        <ConnectTransport
                            key={transport.type}
                            transport={transport}
                            onClose={onClose}
                        />
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    )
}
