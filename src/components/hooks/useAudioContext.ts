import { useEffect, useRef } from "react"

export default function useAudioContext() {
    const audioContextRef = useRef<AudioContext>()

    // final cleanup
    useEffect(
        () => () => {
            audioContextRef.current?.close()
        },
        []
    )

    // needs to be initiated in onClick on safari mobile
    const onClickActivateAudioContext = () => {
        if (audioContextRef.current) return audioContextRef.current

        // activating audio context
        try {
            console.log("activating audio context")
            const ctx = new (window.AudioContext ||
                (window as any).webkitAudioContext)()

            // play silence sound within onlick to unlock it
            const buffer = ctx.createBuffer(1, 1, 22050)
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(ctx.destination)
            source.start()

            audioContextRef.current = ctx

            console.log(`audio context activated`)
            return ctx
        } catch (e) {
            console.error(e)
        }

        return audioContextRef.current
    }

    return {
        onClickActivateAudioContext,
    }
}
