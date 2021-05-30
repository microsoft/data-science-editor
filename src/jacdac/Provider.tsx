import React, { useState, useEffect, ReactNode } from "react"
import JacdacContext from "./Context"
import bus from "./providerbus"

export default function JacdacProvider(props: {
    connectOnStart?: boolean
    children: ReactNode
}) {
    const { connectOnStart, children } = props
    const [firstConnect, setFirstConnect] = useState(false)

    // connect in background on first load.
    useEffect(() => {
        // bus live accross hot-reloads
        if (!firstConnect && connectOnStart) {
            setFirstConnect(true)
            bus.connect(true)
        }
        return () => {}
    }, [])
    return (
        <JacdacContext.Provider value={{ bus }}>
            {children}
        </JacdacContext.Provider>
    )
}
