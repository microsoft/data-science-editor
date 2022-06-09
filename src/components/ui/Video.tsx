/* eslint-disable jsx-a11y/media-has-caption */
import { withPrefix } from "gatsby"
import React, { CSSProperties, useEffect, useRef } from "react"
import { useInView } from "react-intersection-observer"

export default function Video(props: {
    mp4?: string
    webm?: string
    poster?: string
    muted?: boolean
    loop?: boolean
    controls?: boolean
    autoPlay?: boolean
    style?: CSSProperties
    description?: string
    label?: string
    preload?: "metadata" | "none" | "auto"
}) {
    const {
        label,
        mp4,
        webm,
        poster,
        muted = true,
        loop = true,
        controls = false,
        autoPlay = true,
        style,
        preload = "auto",
    } = props
    const { ref, inView } = useInView()
    const videoRef = useRef<HTMLVideoElement>()

    useEffect(() => {
        if (!inView) {
            try {
                videoRef.current?.pause()
            } catch (e) {
                console.debug(e)
            }
        } else {
            try {
                if (autoPlay) videoRef.current?.play()
            } catch (e) {
                console.debug(e)
            }
        }
    }, [inView])

    return (
        <div ref={ref}>
            <video
                aria-label={label}
                style={{ maxWidth: "100%", ...(style || {}) }}
                ref={videoRef}
                playsInline
                controls={controls}
                preload={preload}
                autoPlay={autoPlay && inView}
                muted={muted}
                loop={loop}
                poster={poster}
            >
                {mp4 && <source src={withPrefix(mp4)} type="video/mp4" />}
                {webm && <source src={withPrefix(webm)} type="video/webm" />}
                Sorry, your browser does not support embedded videos.
            </video>
        </div>
    )
}
