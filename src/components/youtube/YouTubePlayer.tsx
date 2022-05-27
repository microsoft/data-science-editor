import React, { CSSProperties, useContext, useId } from "react"
import YouTubeContext from "./YouTubeContext"
import YouTube from "react-youtube"
import DraggableCard from "../ui/DraggableCard"

const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
        // https://developers.google.com/youtube/player_parameters
        autoplay: 1,
    },
}
const style: CSSProperties = {
    aspectRatio: "16 /9",
}

export default function YouTubePlayer() {
    const { videoId, setVideoId } = useContext(YouTubeContext)
    const id = useId()

    const handleClose = () => setVideoId(undefined)

    return (
        <DraggableCard onClose={handleClose}>
            <YouTube opts={opts} style={style} videoId={videoId} id={id} />
        </DraggableCard>
    )
}
