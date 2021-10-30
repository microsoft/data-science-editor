import React, { lazy, useEffect, useMemo, useState } from "react"

import stlSerializer from "@jscad/stl-serializer"

import { Button, Grid } from "@material-ui/core"
import Suspense from "../ui/Suspense"
import { convert, Enclosure } from "./enclosure"

const ModelViewer = lazy(() => import("../home/models/ModelViewer"))
const STLModel = lazy(() => import("../home/models/STLModel"))

export default function EnclosureGenerator(props: {
    module: Enclosure
    color?: string
}) {
    const { color, module } = props
    const [url, setUrl] = useState<string>("")
    const geometry = useMemo(() => {
        try {
            return module ? convert(module) : undefined
        } catch (e) {
            console.warn(e)
            return undefined
        }
    }, [module])
    useEffect(() => {
        if (!geometry) {
            // keep last known good
            return
        }
        const rawData = stlSerializer.serialize(
            { binary: false } as any,
            geometry
        )
        const blob = new Blob(rawData)
        const newUrl = URL.createObjectURL(blob)
        setUrl(newUrl)
        return () => URL.revokeObjectURL(newUrl)
    }, [geometry])

    if (!url) return null

    return (
        <Grid container spacing={1}>
            <Grid item>
                <Button href={url} variant="outlined" color="primary" download="enclosure.stl">
                    Download STL
                </Button>
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <ModelViewer responsive={true}>
                        <STLModel url={url} color={color} />
                    </ModelViewer>
                </Suspense>
            </Grid>
        </Grid>
    )
}
