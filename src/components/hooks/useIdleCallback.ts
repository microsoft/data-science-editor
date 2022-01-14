import { DependencyList, useEffect } from "react"

export default function useIdleCallback(
    cb: () => void,
    timeout: number,
    deps?: DependencyList
) {
    useEffect(() => {
        if (typeof window === "undefined" || !cb) return

        if ("requestIdleCallback" in window) {
            const id = window.requestIdleCallback(cb, { timeout })
            return () => window.cancelIdleCallback(id)
        } else {
            const id = setTimeout(cb, timeout)
            return () => clearTimeout(id)
        }
    }, [cb, timeout, ...(deps || [])])
}
