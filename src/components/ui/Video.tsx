/* eslint-disable jsx-a11y/media-has-caption */
import { withPrefix } from "gatsby"
import React, { CSSProperties, useRef } from "react"
import { useInView } from "react-intersection-observer"
import useEffectAsync from "../useEffectAsync"

export default function Video(props: {
    src?: string
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
        src,
        muted = true,
        loop = true,
        controls = true,
        autoPlay = true,
        style,
        preload = "metadata",
    } = props
    const { ref, inView } = useInView()
    const videoRef = useRef<HTMLVideoElement>()

    useEffectAsync(async () => {
        if (!inView) {
            try {
                await videoRef.current?.pause()
            } catch (e) {
                console.debug(e)
            }
        } else {
            try {
                if (autoPlay) await videoRef.current?.play()
            } catch (e) {
                console.debug(e)
            }
        }
    }, [inView])

    return (
        <div ref={ref}>
            <video
                aria-label={label}
                style={{ width: "100%", ...(style || {}) }}
                ref={videoRef}
                playsInline
                controls={controls}
                preload={preload}
                autoPlay={autoPlay && inView}
                disablePictureInPicture={true}
                muted={muted}
                loop={loop}
                poster={withPrefix(`/videos/${src}.jpg`)}
            >
                <source
                    src={withPrefix(`/videos/${src}.webm`)}
                    type="video/webm"
                />
                <source
                    src={withPrefix(`/videos/${src}.mp4`)}
                    type="video/mp4"
                />
                Sorry, your browser does not support embedded videos.
            </video>
        </div>
    )
}
