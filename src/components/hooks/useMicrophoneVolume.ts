import { useEffect, useRef } from "react";
import { AudioAnalyzerOptions, useMicrophoneAnalyzer } from "./useAudioAnalyzer";

export default function useMicrophoneVolume(enabled: boolean, options?: AudioAnalyzerOptions) {
    const { analyser, onClickActivateMicrophone, closeMicrophone } = useMicrophoneAnalyzer(options);
    const frequencies = useRef(new Uint8Array(0));

    useEffect(() => {
        if (!enabled) closeMicrophone();
    }, [enabled]);

    return {
        onClickActivateMicrophone,
        volume: () => {
            const a = analyser();
            if (!a) return 0;

            if (frequencies.current.length !== a.frequencyBinCount)
                frequencies.current = new Uint8Array(a.frequencyBinCount);
            a.getByteFrequencyData(frequencies.current);
            let max = 0;
            const bins = frequencies.current;
            const n = bins.length;
            for (let i = 0; i < n; ++i)
                max = Math.max(max, bins[i]);
            return max / 0xff;
        }
    }
}