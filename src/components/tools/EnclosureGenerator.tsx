import React, { lazy, useEffect, useState } from "react"

import { Button, Grid } from "@material-ui/core"
import Suspense from "../ui/Suspense"
import { convertToSTL } from "../blockly/dsl/workers/cad.proxy"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"

const ModelViewer = lazy(() => import("../home/models/ModelViewer"))
const STLModel = lazy(() => import("../home/models/STLModel"))

export default function EnclosureGenerator(props: {
    module: EnclosureModel
    options?: EnclosureOptions
    color?: string
}) {
    const { color, module, options } = props
    const [working, setWorking] = useState(false)
    const [url, setUrl] = useState<string>("")

    const updateUrl = async () => {
        try {
            setWorking(true)
            const blob = await convertToSTL(module, options)
            const newUrl = blob ? URL.createObjectURL(blob) : undefined
            setUrl(newUrl)
        } finally {
            setWorking(false)
        }
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
                            disabled={working}
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
