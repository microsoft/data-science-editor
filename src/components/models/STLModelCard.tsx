import React from "react"

import {
    Button,
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    NoSsr,
} from "@mui/material"
import STLModel from "../models/STLModel"
import ModelViewer from "../models/ModelViewer"

export default function STLModelCard(props: {
    name: string
    url: string
    color: string
    autoRotate?: boolean
}) {
    const { name, url, color, autoRotate } = props
    const fn = `${name}.stl`
    return (
        <NoSsr>
            <Card>
                <CardHeader title={fn} />
                <CardMedia>
                    <ModelViewer
                        responsive={true}
                        style={{
                            position: "relative",
                            height: "20rem",
                            width: "100%",
                        }}
                        autoRotate={autoRotate}
                    >
                        <STLModel url={url} color={color} />
                    </ModelViewer>
                </CardMedia>
                <CardActions>
                    <Button href={url} variant="outlined" download={fn}>
                        Download
                    </Button>
                </CardActions>
            </Card>
        </NoSsr>
    )
}
