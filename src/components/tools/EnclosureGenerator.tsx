import React, { lazy, useEffect, useState } from "react"

import {
    Button,
    Card,
    CardActions,
    CardHeader,
    CardMedia,
    Grid,
} from "@mui/material"
import Suspense from "../ui/Suspense"
import { convertToSTL } from "../blockly/dsl/workers/cad.proxy"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"
import useGridBreakpoints from "../useGridBreakpoints"
import useMounted from "../hooks/useMounted"
import { CircularProgress } from "@mui/material"
import { Alert } from "@mui/material"

const ModelViewer = lazy(() => import("../home/models/ModelViewer"))
const STLModel = lazy(() => import("../home/models/STLModel"))

function STLModelCard(props: { name: string; url: string; color: string }) {
    const { name, url, color } = props
    const fn = `${name}.stl`
    return (
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
    )
}

export default function EnclosureGenerator(props: {
    module: EnclosureModel
    options?: EnclosureOptions
    color?: string
}) {
    const { color, module, options } = props
    const [working, setWorking] = useState(false)
    const [files, setFiles] = useState<{ name: string; url: string }[]>()
    const gridBreakpoints = useGridBreakpoints(files?.length)
    const [stlError, setStlError] = useState("")
    const mounted = useMounted()

    const updateUrl = async () => {
        try {
            setStlError(undefined)
            setWorking(true)
            const { stls: files, error } = await convertToSTL(module, options)
            if (!mounted()) return

            const newFiles = files?.map(({ name, blob }) => ({
                name,
                url: URL.createObjectURL(blob),
            }))
            setFiles(newFiles)
            setStlError(error)
        } finally {
            if (mounted()) setWorking(false)
        }
    }
    useEffect(
        () => () => files?.forEach(({ url }) => URL.revokeObjectURL(url)),
        [files]
    )
    const handleClick = () => updateUrl()

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <Button
                    onClick={handleClick}
                    variant="contained"
                    color="primary"
                    disabled={working}
                    startIcon={
                        working && (
                            <CircularProgress
                                size="1rem"
                                title="generating STL files"
                                variant="indeterminate"
                            />
                        )
                    }
                >
                    Generate STL
                </Button>
            </Grid>
            {stlError && (
                <Grid item xs={12}>
                    <Alert severity="error">{stlError}</Alert>
                </Grid>
            )}
            {files?.map(file => (
                <Grid item key={file.name} {...gridBreakpoints}>
                    <STLModelCard {...file} color={color} />
                </Grid>
            ))}
        </Grid>
    )
}
