import React, { useState, useEffect, ReactNode } from "react"
import JacdacContext from "./Context"
import bus from "./providerbus"

export default function JacdacProvider(props: { children: ReactNode }) {
    const { children } = props
    const [firstConnect, setFirstConnect] = useState(false)

    // connect in background on first load.
    useEffect(() => {
        if (!firstConnect) {
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
