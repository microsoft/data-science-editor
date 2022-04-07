import { Dialog, DialogContent, Grid, Typography } from "@mui/material"
import React, { lazy, useCallback } from "react"
import { ControlAnnounceFlags } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import DeviceName from "../devices/DeviceName"
import useInterval from "../hooks/useInterval"
import Alert from "../ui/Alert"
import DialogTitleWithClose from "../ui/DialogTitleWithClose"
import Suspense from "../ui/Suspense"
const LazyDeviceImage = lazy(() => import("../devices/LazyDeviceImage"))

export default function IdentifyDialog(props: {
    device: JDDevice
    open: boolean
    onClose: () => void
}) {
    const { device, open, onClose } = props
    const handleSendIdentify = useCallback(
        async () => await device.identify(),
        [device]
    )
    const handleCloseIdentify = () => onClose()
    const { statusLightFlags } = device
    const blue =
        statusLightFlags === ControlAnnounceFlags.StatusLightRgbFade ||
        statusLightFlags === ControlAnnounceFlags.StatusLightRgbNoFade
    useInterval(open, handleSendIdentify, 5000, [device])
    const specification = useDeviceSpecification(device)

    return (
        <Dialog open={open} onClose={handleCloseIdentify}>
            <DialogTitleWithClose onClose={handleCloseIdentify}>
                Identifying{" "}
                <DeviceName
                    device={device}
                    linkToSpecification={true}
                    onLinkClick={handleCloseIdentify}
                />
                ...
            </DialogTitleWithClose>
            <DialogContent>
                <Grid container alignItems="center" alignContent={"center"}>
                    {specification && (
                        <Grid item xs={12}>
                            <Typography variant="caption">
                                {[
                                    specification.name,
                                    specification.version,
                                    specification.description,
                                ]
                                    .filter(s => !!s)
                                    .join(", ")}
                            </Typography>
                        </Grid>
                    )}
                    <Grid item xs={12}>
                        <Suspense>
                            <LazyDeviceImage device={device} />
                        </Suspense>
                    </Grid>
                    <Grid item xs>
                        <Alert severity="info">
                            Look for four blinks in around 2 seconds with the
                            {blue ? " blue" : " "} LED.
                        </Alert>
                    </Grid>
                </Grid>
            </DialogContent>
        </Dialog>
    )
}
