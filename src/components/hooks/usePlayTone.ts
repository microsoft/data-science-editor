import { useEffect, useRef, useState } from "react"
import { createToneContext, ToneContext } from "./toneContext"

export default function usePlayTone(defaultVolume?: number) {
    const context = useRef<ToneContext>()
    const [activated, setActivated] = useState(false)

    // final cleanup
    useEffect(() => {
        return () => {
            context.current?.close()
        }
    }, [])

    // needs to be initiated in onClick on safari mobile
    const onClickActivateAudioContext = () => {
        if (context.current) return

        try {
            context.current = createToneContext(defaultVolume)
            setActivated(true)
        } catch (e) {
            console.warn(e)
        }
    }
    const setVolume = (volume: number) => context.current?.setVolume(volume)
    const playTone = (frequency: number, duration: number) =>
        context.current?.playTone(frequency, duration)

    return {
        onClickActivateAudioContext,
        setVolume,
        playTone,
        activated,
    }
}
