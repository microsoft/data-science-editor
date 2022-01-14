import React from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import AvatarGroup from "@mui/material/AvatarGroup"
import DeviceAvatar from "./DeviceAvatar"

export default function DeviceAvatarGroup(props: {
    devices: JDDevice[]
    max?: number
    size?: "small" | "large"
}) {
    const { devices, max, size } = props
    // nothing to show
    if (!devices?.length) return null

    return (
        <AvatarGroup spacing={-10} max={max || 6}>
            {devices.map(device => (
                <DeviceAvatar key={device.id} device={device} size={size} />
            ))}
        </AvatarGroup>
    )
}
