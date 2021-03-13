import React, { useContext } from "react"
import ConnectButton from "./ConnectButton"
import JacdacContext, { JacdacContextProps } from "./Context"

export default function ConnectButtons(props: {
    full?: boolean
    className?: string
    transparent?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { transports } = bus
    return (
        <>
            {transports.map(transport => (
                <ConnectButton
                    key={transport.type}
                    transport={transport}
                    {...props}
                />
            ))}
        </>
    )
}
