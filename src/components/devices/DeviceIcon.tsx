import React from "react"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useServiceProvider from "../hooks/useServiceProvider"
import KindIcon from "../KindIcon"
import useDeviceImage from "./useDeviceImage"
import { JDServerServiceProvider } from "../../../jacdac-ts/src/jdom/servers/serverserviceprovider"
import ImageAvatar from "../tools/ImageAvatar"
import { withPrefix } from "gatsby"

export default function DeviceIcon(props: {
    device: JDDevice
    size?: "small" | "large"
    avatar?: boolean
}) {
    const { device, size, avatar } = props
    const specification = useDeviceSpecification(device)
    const imageUrl =
        useDeviceImage(specification, "avatar") ||
        withPrefix("images/missing-device.svg")
    const name = specification?.name || "Image of the device"

    const server = useServiceProvider<JDServerServiceProvider>(device)
    return server ? (
        <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
    ) : (
        <ImageAvatar size={size} alt={name} src={imageUrl} avatar={avatar} />
    )
}
