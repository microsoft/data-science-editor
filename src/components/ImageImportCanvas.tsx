import React, { lazy, useEffect, useMemo, useState } from "react"
import { Box, createStyles, makeStyles } from "@material-ui/core"
import { Skeleton } from "@material-ui/lab"
import useBlobCanvas from "./useBlobCanvas"

import Suspense from "./ui/Suspense"
const ImportButton = lazy(() => import("./ImportButton"))

const useStyles = makeStyles(theme =>
    createStyles({
        root: {
            position: "relative",
        },
        img: {
            margin: "auto",
            display: "block",
            width: "100%",
        },
        btn: {
            position: "absolute",
            borderRadius: "6rem",
            left: "calc(50% - 2rem)",
            top: "calc(50% - 2rem)",
            background: theme.palette.background.paper,
        },
    })
)

export default function ImportImageCanvas(props: {
    width: number
    height: number
    onImageImported?: (cvs: HTMLCanvasElement) => void
}) {
    const { width, height, onImageImported } = props
    const [imageBlob, setImageBlob] = useState<Blob>(undefined)
    const canvas = useBlobCanvas(imageBlob, width, height)
    const canvasUrl = useMemo(() => canvas?.toDataURL("image/png"), [canvas])
    const classes = useStyles()

    const handleFilesUploaded = async (files: File[]) => {
        const file = files[0]
        setImageBlob(file)
    }
    // notify of new canvas
    useEffect(() => canvas && onImageImported(canvas), [canvas])

    return (
        <div className={classes.root}>
            <div className={classes.img}>
                {!canvasUrl && (
                    <Skeleton variant="rect" width={"100%"} height={"18rem"} />
                )}
                {canvasUrl && (
                    <img
                        alt="preview"
                        src={canvasUrl}
                        width={"100%"}
                        height={"100%"}
                    />
                )}
            </div>
            <Box className={classes.btn}>
                <Suspense>
                    <ImportButton
                        icon={true}
                        text="Import 4:3 image"
                        onFilesUploaded={handleFilesUploaded}
                        acceptedFiles={["image/jpeg", "image/png"]}
                    />
                </Suspense>
            </Box>
        </div>
    )
}
