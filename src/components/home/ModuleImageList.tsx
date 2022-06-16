import React from "react"
import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import DeviceImage from "../devices/DeviceImage"

export default function ModuleImageList(props: { cols: number }) {
    return (
        <ImageList cols={props.cols} gap={1}>
            {[
                {
                    id: "kittenbot-keycapbuttonv10",
                    title: "Keycap Button Module",
                },
                {
                    id: "kittenbot-lightsensorv10",
                    title: "Light Sensor Module",
                },
                {
                    id: "kittenbot-rgbringv10",
                    title: "RGB Ring Module",
                },
            ].map(({ id, title }) => (
                <ImageListItem key={id}>
                    <DeviceImage id={id} size="preview" />
                    <ImageListItemBar title={title} />
                </ImageListItem>
            ))}
        </ImageList>
    )
}
