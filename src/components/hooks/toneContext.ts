const VOLUME_GAIN = 0.4

export interface ToneContext {
    close: () => void
    playTone: (frequency: number, duration: number) => void
    setVolume: (vol: number) => void
}

export function createToneContext(defaultVolume?: number): ToneContext {
    try {
        console.log(`create tone context`)
        const ctx = new (window.AudioContext ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).webkitAudioContext)()

        // play silence sound within onlick to unlock it
        const buffer = ctx.createBuffer(1, 1, 22050)
        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.connect(ctx.destination)
        source.start()

        // output node with volume
        const volume = ctx.createGain()
        volume.connect(ctx.destination)
        volume.gain.value =
            (defaultVolume !== undefined ? defaultVolume : 0.2) * VOLUME_GAIN

        const setVolume = (v: number) => {
            if (volume && !isNaN(v)) {
                volume.gain.value = v * VOLUME_GAIN
            }
        }

        const playTone = (frequency: number, duration: number) => {
            try {
                const tone = ctx.createOscillator()
                tone.type = "sawtooth"
                tone.connect(volume)
                tone.frequency.value = frequency // update frequency
                tone.start() // start and stop
                tone.stop(ctx.currentTime + duration / 1000)
            } catch (e) {
                console.debug(e)
            }
        }

        const close = () => {
            try {
                if (ctx.state === "running") ctx.close()
            } catch (e) {
                console.warn(e)
            }
        }

        console.log(`tone context created`)

        return {
            setVolume,
            playTone,
            close,
        }
    } catch (e) {
        return undefined
    }
}
