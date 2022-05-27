import { ButtonProps } from "@mui/material"
import { Button } from "gatsby-theme-material-ui"
import React, { useContext } from "react"
import YouTubeContext from "./YouTubeContext"

export default function YouTubeButton(
    props: { videoId: string } & ButtonProps
) {
    const { videoId, ...rest } = props
    const { setVideoId } = useContext(YouTubeContext)
    const handleClick = () => setVideoId(videoId)

    return (
        <Button {...rest} onClick={handleClick}>
            Play Video
        </Button>
    )
}
