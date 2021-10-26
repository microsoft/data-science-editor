import {
    Button,
    Card,
    CardActions,
    CardHeader,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@material-ui/core"
import React, { useContext, useMemo } from "react"
import { useId } from "react-use-id-hook"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ConnectButton from "../buttons/ConnectButton"
import { deviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import useDeviceImage from "../devices/useDeviceImage"
import CardMediaWithSkeleton from "../ui/CardMediaWithSkeleton"

export default function ConnectTransportDialog(props: {
    open: boolean
    onClose: () => void
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    const { open, onClose } = props
    const dialogId = useId()
    const labelId = useId()
    const devices = useMemo(
        () =>
            deviceSpecifications()
                .map(device => ({
                    device,
                    transport: transports.find(
                        t => t.type === device.transport?.type
                    ),
                }))
                .filter(({ transport }) => !!transport),
        []
    )
    return (
        <Dialog
            id={dialogId}
            aria-labelledby={labelId}
            open={open}
            onClose={onClose}
            fullWidth={true}
        >
            <DialogTitle id={labelId}>
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
            </DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    {devices.map(({ device, transport }) => (
                        <Grid item xs={12} sm={6} key={device.id}>
                            <Card>
                                <CardMediaWithSkeleton
                                    title={"photograph of the device"}
                                    image={useDeviceImage(device, "preview")}
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
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    )
}
