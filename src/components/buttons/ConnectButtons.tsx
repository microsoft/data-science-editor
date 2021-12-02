import React, { useContext, useState } from "react"
import ConnectButton from "./ConnectButton"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMediaQueries from "../hooks/useMediaQueries"
import useChange from "../../jacdac/useChange"
import Button from "../ui/Button"
import AppContext from "../AppContext"
import JacdacIcon from "../icons/JacdacIcon"

function DisconnectedButton(props: {
    full?: "disconnected" | "always"
    className?: string
    transparent?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { mobile } = useMediaQueries()
    const { toggleShowConnectTransportDialog } = useContext(AppContext)
    const { full, transparent, className } = props
    const [working, setWorking] = useState(false)
    const small = !full || mobile
    const trackName = `transport.connect.start`

    const handleConnect = async () => {
        try {
            setWorking(true)
            await bus.connect(true)
            if (!bus.connected) toggleShowConnectTransportDialog()
        } finally {
            setWorking(false)
        }
    }

    if (small)
        return (
            <span>
                <IconButtonWithTooltip
                    title={"Connect to a physical device"}
                    color={transparent ? "inherit" : "primary"}
                    className={className}
                    onClick={handleConnect}
                    disabled={working}
                >
                    <JacdacIcon />
                </IconButtonWithTooltip>
            </span>
        )
    else
        return (
            <Button
                trackName={trackName}
                title="Connect to a physical device"
                size="small"
                variant={transparent ? "outlined" : "contained"}
                color={transparent ? "inherit" : "primary"}
                className={className}
                onClick={handleConnect}
                disabled={working}
            >
                Connect
            </Button>
        )
}

export default function ConnectButtons(props: {
    full?: "disconnected" | "always"
    className?: string
    transparent?: boolean
}) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { full, ...rest } = props
    const { transports } = bus
    const disconnected = useChange(bus, _ => _.disconnected)

    if (!transports?.length) return null

    return disconnected ? (
        <DisconnectedButton {...props} />
    ) : (
        <>
            {transports
                .filter(tr => !tr.disconnected)
                .map(transport => (
                    <ConnectButton
                        key={transport.type}
                        transport={transport}
                        {...rest}
                        full={full === "always"}
                    />
                ))}
        </>
    )
}
