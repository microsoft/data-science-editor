import { DependencyList, useState } from "react"
import useEffectAsync from "./useEffectAsync"

export default function useAsyncMemo<T>(
    factory: () => T | Promise<T>,
    deps?: DependencyList
) {
    const [value, setValue] = useState<T>()
    useEffectAsync(async mounted => {
        const v = await factory()
        if (mounted()) setValue(v)
    }, deps || [])
    return value
}
