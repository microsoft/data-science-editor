import { DependencyList, useEffect } from "react"

type RequestIdleCallbackHandle = any
type RequestIdleCallbackOptions = {
    timeout: number
}
type RequestIdleCallbackDeadline = {
    readonly didTimeout: boolean
    timeRemaining: () => number
}

declare global {
    interface Window {
        requestIdleCallback: (
            callback: (deadline: RequestIdleCallbackDeadline) => void,
            opts?: RequestIdleCallbackOptions
        ) => RequestIdleCallbackHandle
        cancelIdleCallback: (handle: RequestIdleCallbackHandle) => void
    }
}

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
