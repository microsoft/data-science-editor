/* eslint-disable jsx-a11y/media-has-caption */
import { withPrefix } from "gatsby"
import React, { useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

export default function Video(props: {
    mp4?: string
    webp?: string
    poster?: string
    muted?: boolean
    loop?: boolean
}) {
    const { mp4, webp, poster, muted = true, loop = true } = props
    const { ref, inView } = useInView()
    const videoRef = useRef<HTMLVideoElement>()

    useEffect(() => {
        if (!inView) videoRef.current?.pause()
    }, [inView])

    return (
        <div ref={ref}>
            <video
                style={{ width: "100%" }}
                ref={videoRef}
                playsInline
                controls
                preload="auto"
                autoPlay={inView}
                muted={muted}
                loop={loop}
                poster={poster}
            >
                {mp4 && <source src={withPrefix(mp4)} type="video/mp4" />}
                {webp && <source src={withPrefix(webp)} type="video/webp" />}
                Sorry, your browser does not support embedded videos.
            </video>
        </div>
    )
}
