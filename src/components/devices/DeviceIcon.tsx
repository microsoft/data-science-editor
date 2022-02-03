import React from "react"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useServiceProvider from "../hooks/useServiceProvider"
import KindIcon from "../KindIcon"
import useDeviceImage from "./useDeviceImage"
import { JDServerServiceProvider } from "../../../jacdac-ts/src/jdom/servers/serverserviceprovider"
import JacdacIcon from "../icons/JacdacIcon"
import ImageAvatar from "../tools/ImageAvatar"

export default function DeviceIcon(props: {
    device: JDDevice
    size?: "small" | "large"
    avatar?: boolean
}) {
    const { device, size, avatar } = props
    const specification = useDeviceSpecification(device)
    const imageUrl = useDeviceImage(specification, "avatar")

    const server = useServiceProvider<JDServerServiceProvider>(device)
    return server ? (
        <KindIcon kind={VIRTUAL_DEVICE_NODE_NAME} />
    ) : !imageUrl ? (
        <JacdacIcon />
    ) : (
        <ImageAvatar
            size={size}
            alt={specification?.name || "Image of the device"}
            src={imageUrl}
            avatar={avatar}
        />
    )
}
