import React, { useEffect, ReactNode, useRef } from "react"
import JacdacContext from "./Context"
import bus from "./providerbus"

export default function JacdacProvider(props: {
    connectOnStart?: boolean
    children: ReactNode
}) {
    const { connectOnStart, children } = props
    const firstConnect = useRef(false)

    // connect in background on first load.
    useEffect(() => {
        // bus live accross hot-reloads
        if (
            !firstConnect.current &&
            connectOnStart &&
            typeof document !== "undefined" &&
            document.visibilityState === "visible"
        ) {
            firstConnect.current = true
            bus.connect(true)
        }
    }, [])
    return (
        <JacdacContext.Provider value={{ bus }}>
            {children}
        </JacdacContext.Provider>
    )
}
