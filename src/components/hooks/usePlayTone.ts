import { useEffect, useRef } from "react"

const VOLUME_GAIN = 0.5

export default function usePlayTone(defaultVolume?: number) {
    const contextRef = useRef<AudioContext>()
    const volumeRef = useRef<GainNode>()

    // final cleanup
    useEffect(() => {
        return () => {
            try {
                if (contextRef.current.state === "running")
                    contextRef.current?.close()
            } catch (e) {
                console.warn(e)
            }
        }
    }, [])

    const setVolume = (v: number) => {
        if (volumeRef.current && !isNaN(v)) {
            volumeRef.current.gain.value = v * VOLUME_GAIN
        }
    }

    const playTone = (frequency: number, duration: number) => {
        if (!contextRef.current) return
        try {
            const tone = contextRef.current.createOscillator()
            tone.type = "sawtooth"
            tone.connect(volumeRef.current)
            tone.frequency.value = frequency // update frequency
            tone.start() // start and stop
            tone.stop(contextRef.current.currentTime + duration / 1000)
        } catch (e) {
            console.log(e)
        }
    }

    // needs to be initiated in onClick on safari mobile
    const onClickActivateAudioContext = () => {
        if (contextRef.current) return

        try {
            const ctx = (contextRef.current = new (window.AudioContext ||
                (window as any).webkitAudioContext)())

            // play silence sound within onlick to unlock it
            const buffer = ctx.createBuffer(1, 1, 22050)
            const source = ctx.createBufferSource()
            source.buffer = buffer
            source.connect(ctx.destination)
            source.start()

            // output node with volume
            const volumeNode = (volumeRef.current = ctx.createGain())
            volumeNode.connect(ctx.destination)
            volumeNode.gain.value =
                (defaultVolume !== undefined ? defaultVolume : 0.2) *
                VOLUME_GAIN
        } catch (e) {
            contextRef.current = undefined
            volumeRef.current = undefined
            console.error(e)
        }
    }

    return {
        onClickActivateAudioContext,
        setVolume,
        playTone,
    }
}
