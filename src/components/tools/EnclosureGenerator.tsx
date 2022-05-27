import React, { lazy, useEffect, useState } from "react"

import { Button, Grid, NoSsr } from "@mui/material"
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

const STLModelCard = lazy(() => import("../models/STLModelCard"))

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

    useEffect(() => {
        if (module) updateUrl()
    }, [])

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
                    <NoSsr>
                        <Suspense>
                            <STLModelCard {...file} color={color} />
                        </Suspense>
                    </NoSsr>
                </Grid>
            ))}
        </Grid>
    )
}
