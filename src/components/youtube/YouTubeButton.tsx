import { ButtonProps } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useContext } from "react"
import useFireKey from "../hooks/useFireKey"
import YouTubeContext from "./YouTubeContext"

export default function YouTubeButton(
    props: { videoId: string } & ButtonProps
) {
    const { videoId, variant = "outlined", ...rest } = props
    const { setVideoId } = useContext(YouTubeContext)
    const handleClick = () => setVideoId(videoId)
    const fireClick = useFireKey(handleClick)

    return (
        <Button
            variant={variant}
            {...rest}
            onClick={handleClick}
            onPointerDown={handleClick}
            onKeyDown={fireClick}
        >
            Play Video
        </Button>
    )
}
