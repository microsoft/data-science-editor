import React, { CSSProperties, lazy, useContext } from "react"
import YouTubeContext from "./YouTubeContext"
import DraggableCard from "../ui/DraggableCard"
import PlayCircleIcon from "@mui/icons-material/PlayCircle"
import Suspense from "../ui/Suspense"
const ReactPlayer = lazy(() => import("react-player/lazy"))

const style: CSSProperties = {
    aspectRatio: "16 /9",
}

export default function YouTubePlayer() {
    const { videoId, setVideoId } = useContext(YouTubeContext)

    const url = `https://www.youtube.com/watch?v=${videoId}`
    const handleClose = () => setVideoId(undefined)

    return (
        <DraggableCard onClose={handleClose}>
            <Suspense>
                <ReactPlayer
                    playIcon={<PlayCircleIcon />}
                    pip={false}
                    playsinline={true}
                    style={style}
                    controls={true}
                    url={url}
                    width="100%"
                    height="100%"
                />
            </Suspense>
        </DraggableCard>
    )
}
