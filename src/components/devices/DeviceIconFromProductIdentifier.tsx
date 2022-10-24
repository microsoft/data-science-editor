import React from "react"
import { useDeviceSpecificationFromProductIdentifier } from "../../jacdac/useDeviceSpecification"
import useDeviceImage from "./useDeviceImage"
import ImageAvatar from "../tools/ImageAvatar"
import { withPrefix } from "gatsby"

export default function DeviceIconFromProductIdentifier(props: {
    productIdentifier: number
    size?: "small" | "large"
    avatar?: boolean
}) {
    const { productIdentifier, size, avatar } = props
    const specification =
        useDeviceSpecificationFromProductIdentifier(productIdentifier)
    const imageUrl =
        useDeviceImage(specification, "avatar") ||
        withPrefix("images/missing-device.svg")
    const name = specification?.name || "Image of the device"

    return <ImageAvatar size={size} alt={name} src={imageUrl} avatar={avatar} />
}
