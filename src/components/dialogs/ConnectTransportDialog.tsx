import {
    Card,
    CardActions,
    CardHeader,
    Dialog,
    DialogContent,
    Grid,
} from "@mui/material"
import React, { useContext, useMemo } from "react"
import { useId } from "react-use-id-hook"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ConnectButton from "../buttons/ConnectButton"
import useDeviceImage from "../devices/useDeviceImage"
import CardMediaWithSkeleton from "../ui/CardMediaWithSkeleton"
import useDeviceSpecifications from "../devices/useDeviceSpecifications"
import Transport from "../../../jacdac-ts/src/jdom/transport/transport"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"

function ConnectDeviceCard(props: {
    device: jdspec.DeviceSpec
    transport: Transport
    onClose: () => void
}) {
    const { device, transport, onClose } = props
    const image = useDeviceImage(device, "preview")
    return (
        <Card>
            <CardMediaWithSkeleton
                title={"photograph of the device"}
                image={image}
            />
            <CardHeader subheader={device.name} />
            <CardActions>
                <ConnectButton
                    specification={device}
                    transport={transport}
                    full={true}
                    transparent={true}
                    onClick={onClose}
                />
            </CardActions>
        </Card>
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
    const labelId = useId()
    const specifications = useDeviceSpecifications()
    const devices = useMemo(
        () =>
            specifications
                .map(device => ({
                    device,
                    transport: transports.find(
                        t => t.type === device.transport?.type
                    ),
                }))
                .filter(({ transport }) => !!transport),
        [specifications]
    )
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
                {transports.map(transport => (
                    <ConnectButton
                        key={transport.type}
                        transport={transport}
                        full={false}
                        transparent={true}
                        onClick={onClose}
                    />
                ))}
            </DialogTitleWithClose>
            <DialogContent>
                <Grid container spacing={2}>
                    {devices.map(({ device, transport }) => (
                        <Grid item xs={12} sm={6} key={device.id}>
                            <ConnectDeviceCard
                                device={device}
                                transport={transport}
                                onClose={onClose}
                            />
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
        </Dialog>
    )
}
