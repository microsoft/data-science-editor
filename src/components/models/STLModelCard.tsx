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
}) {
    const { name, url, color } = props
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
