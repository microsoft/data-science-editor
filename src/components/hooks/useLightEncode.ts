import { useMemo } from "react"
import { lightEncode } from "../../../jacdac-ts/src/jdom/light"

export default function useLightEncode(source: string) {
    return useMemo(() => {
        let encoded: Uint8Array
        let error: string
        try {
            encoded = lightEncode(source, [])
        } catch (e: unknown) {
            error = (e as any)?.message || e + ""
        }
        return { encoded, error }
    }, [source])
}
