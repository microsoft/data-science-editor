import React, { lazy } from "react"

import {
    Button,
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    NoSsr,
} from "@mui/material"
import Suspense from "../ui/Suspense"

const ModelViewer = lazy(() => import("../models/ModelViewer"))
const STLModel = lazy(() => import("../models/STLModel"))

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
                    <Suspense>
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
                    </Suspense>
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
