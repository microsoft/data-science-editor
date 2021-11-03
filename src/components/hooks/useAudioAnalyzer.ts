import { useEffect, useRef } from "react"
import useAudioContext from "./useAudioContext"

export interface AudioAnalyzerOptions {
    fftSize?: number
    smoothingTimeConstant?: number
    minDecibels?: number
    maxDecibels?: number
}

export function useMicrophoneAnalyzer(options?: AudioAnalyzerOptions) {
    const { fftSize, smoothingTimeConstant, minDecibels, maxDecibels } =
        options || {}
    const { onClickActivateAudioContext } = useAudioContext()
    const analyzerRef = useRef<AnalyserNode>()
    const microphoneSource = useRef<MediaStreamAudioSourceNode>()

    const applyOptions = () => {
        const analyzer = analyzerRef.current
        if (analyzer) {
            // must be multiple of power of two
            if (!isNaN(fftSize)) analyzer.fftSize = fftSize
            if (!isNaN(smoothingTimeConstant))
                analyzer.smoothingTimeConstant = smoothingTimeConstant
            if (!isNaN(minDecibels)) analyzer.minDecibels = minDecibels
            if (!isNaN(maxDecibels)) analyzer.maxDecibels = maxDecibels
        }
    }

    // grab microphone
    const onClickActivateMicrophone = async () => {
        if (analyzerRef.current) {
            return analyzerRef.current
        }

        const audioContext = onClickActivateAudioContext()
        try {
            console.log("activating microphone", { audioContext })
            const resp = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true,
            })

            const source = (microphoneSource.current =
                audioContext.createMediaStreamSource(resp))
            const node = audioContext.createAnalyser()
            source.connect(node)
            analyzerRef.current = node
            applyOptions()

            console.log(`microphone analyzer activated`)
        } catch (e) {
            console.warn(e)
        }

        return analyzerRef.current
    }

    const closeMicrophone = () => {
        if (!microphoneSource.current) return

        try {
            console.log(`closing microphone`)
            const stream = microphoneSource.current?.mediaStream
            microphoneSource.current?.disconnect()
            analyzerRef.current?.disconnect()
            const tracks = stream?.getTracks()
            tracks?.forEach(track => track.stop())
        } catch (e) {
            console.warn(e)
        } finally {
            microphoneSource.current = undefined
            analyzerRef.current = undefined
        }
    }

    // final cleanup
    useEffect(() => closeMicrophone, [])

    // update options
    useEffect(applyOptions, [
        analyzerRef.current,
        fftSize,
        smoothingTimeConstant,
        minDecibels,
        maxDecibels,
    ])

    return {
        onClickActivateMicrophone,
        closeMicrophone,
        analyser: () => analyzerRef.current,
    }
}
