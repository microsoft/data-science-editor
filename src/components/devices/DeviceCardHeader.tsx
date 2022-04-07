import { CardHeader, Grid, Typography } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React, { lazy } from "react"
import DeviceActions from "./DeviceActions"
import DeviceName from "./DeviceName"
import DeviceCardMedia from "./DeviceCardMedia"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import DeviceAvatar from "./DeviceAvatar"
import useDeviceDescription from "../../jacdac/useDeviceDescription"
import Suspense from "../ui/Suspense"
const DeviceFirmwareVersionChip = lazy(
    () => import("./DeviceFirmwareVersionChip")
)
const DeviceTemperatureChip = lazy(() => import("./DeviceTemperatureChip"))

export default function DeviceCardHeader(props: {
    device: JDDevice
    showAvatar?: boolean
    showDeviceId?: boolean
    showFirmware?: boolean
    showTemperature?: boolean
    showMedia?: boolean
    showSettings?: boolean
    showReset?: boolean
    showDescription?: boolean
}) {
    const {
        device,
        showFirmware,
        showTemperature,
        showMedia,
        showDeviceId,
        showAvatar,
        showSettings,
        showReset,
        showDescription,
    } = props
    const specification = useDeviceSpecification(device)
    const description = useDeviceDescription(showDescription && device)

    return (
        <>
            {showMedia && <DeviceCardMedia device={device} />}
            <CardHeader
                avatar={showAvatar && <DeviceAvatar device={device} />}
                action={
                    <DeviceActions
                        device={device}
                        showReset={showReset}
                        showSettings={showSettings}
                        hideIdentity={showAvatar}
                    />
                }
                title={
                    <DeviceName device={device} linkToSpecification={true} />
                }
                subheader={
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="caption" gutterBottom>
                                {[
                                    specification?.name,
                                    showDeviceId && device.deviceId,
                                    showDescription && description,
                                ]
                                    .filter(s => !!s)
                                    .join(", ")}
                            </Typography>
                        </Grid>

                        {showFirmware && (
                            <Grid item>
                                <Suspense>
                                    <DeviceFirmwareVersionChip
                                        device={device}
                                    />
                                </Suspense>
                            </Grid>
                        )}
                        {showTemperature && (
                            <Grid item>
                                <Suspense>
                                    <DeviceTemperatureChip device={device} />
                                </Suspense>
                            </Grid>
                        )}
                    </Grid>
                }
            />
        </>
    )
}
