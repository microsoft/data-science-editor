import React, { ReactNode } from "react"
import JacdacContext from "./Context"
import bus from "./providerbus"

export default function JacdacProvider(props: { children: ReactNode }) {
    const { children } = props

    return (
        <JacdacContext.Provider value={{ bus }}>
            {children}
        </JacdacContext.Provider>
    )
}
