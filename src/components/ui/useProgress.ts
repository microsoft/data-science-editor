import { useState } from "react"
import useEffectAsync from "../useEffectAsync"

export default function useProgress() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [instance, setInstance] = useState<any>()

    useEffectAsync(async mounted => {
        if (typeof self !== "undefined") {
            const i = await import("accessible-nprogress")
            if (mounted()) setInstance(i)
        }
    }, [])

    const start: () => void = () => instance?.start
    const done: () => void = () => instance?.done
    return { start, done }
}
