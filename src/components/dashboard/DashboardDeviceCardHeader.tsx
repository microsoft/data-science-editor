import { CardHeader, Typography } from "@mui/material"
import React from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import DeviceName from "../devices/DeviceName"
import DeviceAvatar from "../devices/DeviceAvatar"
import DeviceActions from "../devices/DeviceActions"
import useDeviceDescription from "../../jacdac/useDeviceDescription"

export default function DashboardDeviceCardHeader(props: {
    device: JDDevice
    showAvatar?: boolean
    showReset?: boolean
}) {
    const { device, showAvatar, showReset } = props
    const description = useDeviceDescription(device)

    return (
        <CardHeader
            style={{ paddingBottom: 0 }}
            avatar={showAvatar && <DeviceAvatar device={device} />}
            action={
                <DeviceActions
                    device={device}
                    showStop={true}
                    hideIdentity={true}
                    showReset={showReset}
                    showSettings={false}
                />
            }
            title={<DeviceName showShortId={false} device={device} />}
            subheader={
                <>
                    {description && (
                        <Typography variant="caption" gutterBottom>
                            {description}
                        </Typography>
                    )}
                </>
            }
        />
    )
}
