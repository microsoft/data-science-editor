import React from "react"
import { ImageList } from "@mui/material"
import DeviceImageListItem from "./DeviceImageListItem"

export default function DeviceImageList(props: {
    ids: string[]
    cols?: number
    size?: "avatar" | "lazy" | "catalog" | "preview" | "full"
    showName?: boolean
}) {
    const { cols = 3, size = "preview", ids, ...rest } = props
    return (
        <ImageList cols={cols} gap={1}>
            {ids.map(id => (
                <DeviceImageListItem key={id} id={id} size={size} {...rest} />
            ))}
        </ImageList>
    )
}
