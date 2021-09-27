import { DependencyList, useEffect } from "react"

export default function useInterval(
    enabled: boolean,
    handler: () => void,
    delay: number,
    deps?: DependencyList
) {
    useEffect(() => {
        if (enabled && delay > 0) {
            const id = setInterval(handler, delay)
            handler()
            return () => clearInterval(id)
        }
    }, [enabled, delay, ...(deps || [])])
}
