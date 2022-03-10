import { ImageListItem, ImageListItemBar } from "@mui/material"
import React from "react"
import { useDeviceSpecificationFromIdentifier } from "../../jacdac/useDeviceSpecification"
import DeviceImage from "./DeviceImage"

export default function DeviceImageListItem(props: {
    id: string
    size: "avatar" | "lazy" | "catalog" | "preview" | "full"
    showName?: boolean
}) {
    const { id, size, showName } = props
    const spec = useDeviceSpecificationFromIdentifier(id)
    if (!spec) return null

    const { name } = spec

    return (
        <ImageListItem key={id}>
            <DeviceImage id={id} size={size} />
            {showName && <ImageListItemBar title={name} />}
        </ImageListItem>
    )
}
