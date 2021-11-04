import React from "react"
import useChange from "../../jacdac/useChange"
import useDeviceCatalog from "./useDeviceCatalog"
import useDeviceImage from "./useDeviceImage"

export default function DeviceImage(props: {
    id: string
    size: "avatar" | "lazy" | "catalog" | "preview" | "full"
}) {
    const { id, size } = props
    const deviceCatalog = useDeviceCatalog()
    const spec = useChange(
        deviceCatalog,
        _ => _.specificationFromIdentifier(id),
        [id]
    )
    const url = useDeviceImage(spec, size)

    if (!url) return null

    return <img src={url} alt={spec.name} loading="lazy" />
}
