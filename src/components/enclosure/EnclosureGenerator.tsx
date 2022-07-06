import React, { lazy, useEffect, useState } from "react"

import { Button, Grid } from "@mui/material"
import Suspense from "../ui/Suspense"
import { convertToSTL } from "../blockly/dsl/workers/cad.proxy"
import type {
    EnclosureModel,
    EnclosureOptions,
} from "../../workers/cad/dist/node_modules/enclosurecad"
import useGridBreakpoints from "../useGridBreakpoints"
import { CircularProgress } from "@mui/material"
import { Alert } from "@mui/material"

const STLModelCard = lazy(() => import("../models/STLModelCard"))
const EC30Card = lazy(() => import("../ec30/EC30Card"))

export default function EnclosureGenerator(props: {
    model: EnclosureModel
    options?: EnclosureOptions
    color?: string
    hideAfterGenerated?: boolean
    showSave?: boolean
}) {
    const {
        color = "#888",
        model,
        options,
        hideAfterGenerated,
        showSave,
    } = props
    const [working, setWorking] = useState(false)
    const [files, setFiles] = useState<{ name: string; url: string }[]>()
    const gridBreakpoints = useGridBreakpoints(files?.length)
    const [stlError, setStlError] = useState("")
    const [hideGenerate, setHideGenerate] = useState(false)

    const updateUrl = async () => {
        try {
            setStlError(undefined)
            setWorking(true)
            const { stls: files, error } = await convertToSTL(model, options)
            const newFiles = files?.map(({ name, blob }) => ({
                name,
                url: URL.createObjectURL(blob),
            }))
            setFiles(newFiles)
            setStlError(error)
            if (hideAfterGenerated) setHideGenerate(true)
        } finally {
            setWorking(false)
        }
    }
    useEffect(
        () => () => files?.forEach(({ url }) => URL.revokeObjectURL(url)),
        [files]
    )

    const handleClick = async () => {
        await updateUrl()
        await updateUrl()
    }
    return (
        <Grid container spacing={1}>
            {!hideGenerate && (
                <Grid item xs={12}>
                    <Button
                        onClick={handleClick}
                        variant="outlined"
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
                        Generate Enclosure
                    </Button>
                </Grid>
            )}
            {stlError && (
                <Grid item xs={12}>
                    <Alert severity="error">{stlError}</Alert>
                </Grid>
            )}
            {model && (
                <Grid item>
                    <Suspense>
                        <EC30Card model={model} showSave={showSave} />
                    </Suspense>
                </Grid>
            )}
            {files?.map(file => (
                <Grid item key={file.name} {...gridBreakpoints}>
                    <Suspense>
                        <STLModelCard
                            {...file}
                            autoRotate={true}
                            color={color}
                        />
                    </Suspense>
                </Grid>
            ))}
        </Grid>
    )
}
