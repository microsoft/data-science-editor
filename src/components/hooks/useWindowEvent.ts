import { DependencyList, useEffect } from "react"

export default function useWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => unknown,
    passive = false,
    deps?: DependencyList
) {
    useEffect(() => {
        if (typeof self === "undefined" || !listener) return undefined // SSR

        // initiate the event handler
        self.addEventListener<K>(type, listener, passive)

        // this will clean up the event every time the component is re-rendered
        return () => self.removeEventListener<K>(type, listener)
    }, [type, listener, passive, ...(deps || [])])
}
