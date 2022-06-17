import React, { lazy, useState } from "react"
import ConnectButton from "./ConnectButton"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useMediaQueries from "../hooks/useMediaQueries"
import useChange from "../../jacdac/useChange"
import Button from "../ui/Button"
import InputIcon from "@mui/icons-material/Input"
import Suspense from "../ui/Suspense"
import useBus from "../../jacdac/useBus"
const ConnectTransportDialog = lazy(
    () => import("../dialogs/ConnectTransportDialog")
)

function DisconnectedButton(props: {
    full?: "disconnected" | "always"
    className?: string
    transparent?: boolean
    working?: boolean
    handleConnect?: () => void
}) {
    const { full, transparent, className, working, handleConnect } = props
    const { mobile } = useMediaQueries()
    const small = !full || mobile
    const trackName = `transport.connect.start`

    return (
        <>
            {small ? (
                <span>
                    <IconButtonWithTooltip
                        title={"Connect to a physical device"}
                        color={transparent ? "inherit" : "primary"}
                        className={className}
                        onClick={handleConnect}
                        disabled={working}
                    >
                        <InputIcon />
                    </IconButtonWithTooltip>
                </span>
            ) : (
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
            )}
        </>
    )
}

export default function ConnectButtons(props: {
    full?: "disconnected" | "always"
    className?: string
    transparent?: boolean
}) {
    const { full, ...rest } = props
    const bus = useBus()
    const { transports } = bus
    const [open, setOpen] = useState(false)
    const [working, setWorking] = useState(false)
    const disconnected = useChange(bus, _ => _.disconnected)
    if (!transports?.length) return null

    const handleConnect = async () => {
        try {
            setWorking(true)
            await bus.connect(true)
            if (!bus.connected) {
                setOpen(true)
            }
        } finally {
            setWorking(false)
        }
    }
    const handleClose = () => setOpen(false)
    return (
        <>
            {disconnected ? (
                <DisconnectedButton
                    {...props}
                    working={working}
                    handleConnect={handleConnect}
                />
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
            )}
            {open && (
                <Suspense>
                    <ConnectTransportDialog open={open} onClose={handleClose} />
                </Suspense>
            )}
        </>
    )
}
