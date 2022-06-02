import React, { createContext, useState } from "react"

export interface YouTubeProps {
    videoId: string
    setVideoId: (videoId: string) => void
}

const YouTubeContext = createContext<YouTubeProps>({
    videoId: undefined,
    setVideoId: () => {},
})
YouTubeContext.displayName = "youtube"

export default YouTubeContext

// eslint-disable-next-line react/prop-types
export const YouTubeProvider = ({ children }) => {
    const [videoId, setVideoId] = useState("youtube_videoid")

    return (
        <YouTubeContext.Provider value={{ videoId, setVideoId }}>
            {children}
        </YouTubeContext.Provider>
    )
}
