import { ButtonProps } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useContext } from "react"
import useMediaQueries from "../hooks/useMediaQueries"
import YouTubeContext from "./YouTubeContext"

export default function YouTubeButton(
    props: { videoId: string } & ButtonProps
) {
    const { videoId, variant = "outlined", ...rest } = props
    const { setVideoId } = useContext(YouTubeContext)
    const handleClick = () => setVideoId(videoId)
    const { mobile } = useMediaQueries()
    const label = "Play Video"

    return (
        <Button
            variant={variant}
            {...rest}
            onClick={mobile ? undefined : handleClick}
            href={mobile ? `https://youtu.be/watch?v=${videoId}` : undefined}
        >
            {label}
        </Button>
    )
}
