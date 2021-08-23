import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
} from "@material-ui/core"
import React, { useState } from "react"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useDeviceImage from "../devices/useDeviceImage"
import useInterval from "../hooks/useInterval"
import Alert from "../ui/Alert"

function LazyDeviceImage(props: { device: JDDevice }) {
    const { device } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "lazy")
    const largeImageUrl = useDeviceImage(specification)
    const [showLarge, setShowLarge] = useState(false)

    if (!imageUrl) return null

    const handleLargeLoaded = () => setShowLarge(true)

    return (
        <>
            <img
                style={{
                    width: "100%",
                    display: showLarge ? undefined : "none",
                }}
                src={largeImageUrl}
                onLoad={handleLargeLoaded}
            />
            {!showLarge && (
                <img
                    style={{
                        minHeight: "18rem",
                        width: "100%",
                        filter: "blur",
                    }}
                    src={imageUrl}
                />
            )}
        </>
    )
}

export default function IdentifyDialog(props: {
    device: JDDevice
    open: boolean
    onClose: () => void
}) {
    const { device, open, onClose } = props
    const handleSendIdentify = async () => await device.identify()
    const handleCloseIdentify = () => onClose()
    useInterval(open, handleSendIdentify, 3500, [device])

    return (
        <Dialog open={open} onClose={handleCloseIdentify}>
            <DialogTitle>Identifying {device.friendlyName}...</DialogTitle>
            <DialogContent>
                <Grid container alignItems="center" alignContent={"center"}>
                    <Grid item xs={12}>
                        <LazyDeviceImage device={device} />
                    </Grid>
                    <Grid item xs>
                        <Alert severity="info">
                            Look for four blinks in around 2 seconds with the
                            blue LED.
                        </Alert>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined" onClick={handleCloseIdentify}>
                    Dismiss
                </Button>
            </DialogActions>
        </Dialog>
    )
}
