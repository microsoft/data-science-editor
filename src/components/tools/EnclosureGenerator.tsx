import React, { lazy, useEffect, useMemo, useState } from "react"

import stlSerializer from "@jscad/stl-serializer"

import { Button, Grid } from "@material-ui/core"
import Suspense from "../ui/Suspense"
import { convert, EnclosureModel, EnclosureOptions } from "./enclosurecad"

const ModelViewer = lazy(() => import("../home/models/ModelViewer"))
const STLModel = lazy(() => import("../home/models/STLModel"))

export default function EnclosureGenerator(props: {
    module: EnclosureModel
    options?: EnclosureOptions
    color?: string
}) {
    const { color, module, options } = props
    const [url, setUrl] = useState<string>("")
    const geometry = useMemo(() => {
        try {
            return module ? convert(module, options) : undefined
        } catch (e) {
            console.warn(e)
            return undefined
        }
    }, [module])

    const updateUrl = () => {
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
    }
    useEffect(() => () => URL.revokeObjectURL(url), [url])
    const handleClick = () => updateUrl()

    return (
        <Grid container spacing={1}>
            <Grid item>
                <Grid container spacing={1} direction="row">
                    <Grid item>
                        <Button
                            onClick={handleClick}
                            variant="contained"
                            color="primary"
                            disabled={!geometry}
                        >
                            Refresh STL
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            href={url}
                            variant="outlined"
                            color="primary"
                            download="enclosure.stl"
                            disabled={!url}
                        >
                            Download STL
                        </Button>
                    </Grid>
                </Grid>
            </Grid>
            {url && (
                <Grid item xs={12}>
                    <Suspense>
                        <ModelViewer responsive={true}>
                            <STLModel url={url} color={color} />
                        </ModelViewer>
                    </Suspense>
                </Grid>
            )}
        </Grid>
    )
}
