import React from "react"
import { useDeviceSpecificationFromIdentifier } from "../../jacdac/useDeviceSpecification"
import useDeviceImage from "./useDeviceImage"

export default function DeviceImage(props: {
    id: string
    size: "avatar" | "lazy" | "catalog" | "preview" | "full"
}) {
    const { id, size } = props
    const spec = useDeviceSpecificationFromIdentifier(id)
    const url = useDeviceImage(spec, size)

    if (!url) return null

    return (
        <img
            style={{ aspectRatio: "4 / 3", margin: 0 }}
            src={url}
            alt={spec.name}
            loading="lazy"
        />
    )
}
