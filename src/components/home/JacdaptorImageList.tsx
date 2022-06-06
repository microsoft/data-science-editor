import React from "react"
import { ImageList, ImageListItem, ImageListItemBar } from "@mui/material"
import DeviceImage from "../devices/DeviceImage"

export default function JacdapterImageList(props: { cols: string }) {
    return (
        <ImageList cols={parseInt(props.cols)} gap={1}>
            {[
                {
                    id: "kittenbot-jacdaptorformicrobitv2v10",
                    title: "micro:bit V2",
                },
                {
                    id: "microsoft-research-jmspibridgev37v37",
                    title: "Raspberry Pi",
                },
                {
                    id: "microsoft-research-jmbrainrp204059v01",
                    title: "USB",
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
