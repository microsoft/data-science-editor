import React from "react"
import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import DeviceImage from "../devices/DeviceImage"

export default function BrainImageList(props: { cols: number }) {
    return (
        <ImageList cols={props.cols} gap={1}>
            {[
                {
                    id: "microbit-educational-foundation-microbitv2",
                    title: "micro:bit V2",
                },
                {
                    id: "microsoft-research-jmbrainesp3248v03",
                    title: "JM Brain ESP32",
                },
                {
                    id: "microsoft-research-jmjacscriptstarbrainv33",
                    title: "Jacscript Star-Brain",
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
