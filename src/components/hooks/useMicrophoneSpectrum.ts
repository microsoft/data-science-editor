import { useEffect, useRef } from "react"
import { AudioAnalyzerOptions, useMicrophoneAnalyzer } from "./useAudioAnalyzer"

export default function useMicrophoneSpectrum(
    enabled: boolean,
    options?: AudioAnalyzerOptions
) {
    const { analyser, onClickActivateMicrophone, closeMicrophone } =
        useMicrophoneAnalyzer(options)
    const frequencies = useRef(new Uint8Array(0))

    useEffect(() => {
        if (!enabled) closeMicrophone()
    }, [enabled])

    return {
        onClickActivateMicrophone,
        spectrum: () => {
            const a = analyser()
            if (!a) return frequencies.current

            if (frequencies.current.length !== a.frequencyBinCount)
                frequencies.current = new Uint8Array(a.frequencyBinCount)
            a?.getByteFrequencyData(frequencies.current)
            return frequencies.current
        },
    }
}
