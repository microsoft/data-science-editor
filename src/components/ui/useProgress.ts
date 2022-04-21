import { useRef } from "react"
import useEffectAsync from "../useEffectAsync"

export default function useProgress() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = useRef<any>()

    useEffectAsync(async mounted => {
        if (typeof self !== "undefined") {
            const i = await import("accessible-nprogress")
            if (mounted()) instance.current = i
        }
    }, [])

    const start: () => void = () => instance.current?.start
    const done: () => void = () => instance.current?.done
    return { start, done }
}
