import { DependencyList, useEffect } from "react"

export default function useWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    passive = false,
    deps?: DependencyList
) {
    useEffect(() => {
        if (typeof window === "undefined" || !listener) return undefined // SSR

        // initiate the event handler
        window.addEventListener<K>(type, listener, passive)

        // this will clean up the event every time the component is re-rendered
        return () => window.removeEventListener<K>(type, listener)
    }, [type, listener, passive, ...(deps || [])])
}
