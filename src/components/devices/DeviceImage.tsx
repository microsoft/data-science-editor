import React from "react"
import { deviceSpecificationFromIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import useDeviceImage from "./useDeviceImage"

export default function DeviceImage(props: {
    id: string
    size?: "avatar" | "lazy" | "catalog" | "preview"
}) {
    const { id, size } = props
    const spec = deviceSpecificationFromIdentifier(id)
    const url = useDeviceImage(spec, size)

    if (!url) return null

    return <img src={url} alt={spec.name} loading="lazy" />
}
