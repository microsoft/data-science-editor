import React, { lazy, useEffect, useMemo, useState } from "react"
import { styled } from "@mui/material/styles"
import { Box } from "@mui/material"
import { Skeleton } from "@mui/material"
import useBlobCanvas from "../useBlobCanvas"

import Suspense from "./Suspense"
const PREFIX = "ImageImportCanvas"

const classes = {
    root: `${PREFIX}root`,
    img: `${PREFIX}img`,
    btn: `${PREFIX}btn`,
}

const Root = styled("div")(({ theme }) => ({
    [`&.${classes.root}`]: {
        position: "relative",
    },

    [`& .${classes.img}`]: {
        margin: "auto",
        display: "block",
        width: "100%",
    },

    [`& .${classes.btn}`]: {
        position: "absolute",
        borderRadius: "6rem",
        left: "calc(50% - 2rem)",
        top: "calc(50% - 2rem)",
        background: theme.palette.background.paper,
    },
}))

const ImportButton = lazy(() => import("../ImportButton"))

export default function ImportImageCanvas(props: {
    width: number
    height: number
    onImageImported?: (cvs: HTMLCanvasElement) => void
}) {
    const { width, height, onImageImported } = props
    const [imageBlob, setImageBlob] = useState<Blob>(undefined)
    const canvas = useBlobCanvas(imageBlob, width, height)
    const canvasUrl = useMemo(() => canvas?.toDataURL("image/png"), [canvas])

    const handleFilesUploaded = async (files: File[]) => {
        const file = files[0]
        setImageBlob(file)
    }
    // notify of new canvas
    useEffect(() => canvas && onImageImported(canvas), [canvas])

    return (
        <Root className={classes.root}>
            <div className={classes.img}>
                {!canvasUrl && (
                    <Skeleton
                        variant="rectangular"
                        width={"100%"}
                        height={"18rem"}
                    />
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
        </Root>
    )
}
