import React from "react"
import { Button } from "gatsby-theme-material-ui"
import Transport, {
    ConnectionState,
} from "../../../jacdac-ts/src/jdom/transport/transport"
import { Badge } from "@material-ui/core"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import TransportIcon from "../icons/TransportIcon"
import useChange from "../../jacdac/useChange"
import useMediaQueries from "../hooks/useMediaQueries"

export default function ConnectButton(props: {
    full?: boolean
    className?: string
    transparent?: boolean
    transport: Transport
}) {
    const { full, className, transparent, transport } = props
    const { type } = transport
    const connectionState = useChange(transport, t => t.connectionState)
    const showDisconnect =
        connectionState == ConnectionState.Connected ||
        connectionState == ConnectionState.Disconnecting
    const inProgress =
        connectionState == ConnectionState.Connecting ||
        connectionState == ConnectionState.Disconnecting
    const { mobile } = useMediaQueries()
    const small = full !== true && (!full || mobile)
    const disabled =
        connectionState != ConnectionState.Connected &&
        connectionState != ConnectionState.Disconnected
    const onClick = showDisconnect
        ? () => transport.disconnect()
        : () => transport.connect()
    const icon = (
        <Badge color="primary" variant="dot" invisible={!showDisconnect}>
            <TransportIcon type={transport.type} />
        </Badge>
    )
    const label = showDisconnect
        ? `disconnect from ${type}`
        : `connect to a Jacdac device with ${type}`
    const title = showDisconnect ? `disconnect ${type}` : `connect ${type}`

    if (small)
        return (
            <span>
                <IconButtonWithProgress
                    aria-label={label}
                    title={title}
                    color={transparent ? "inherit" : "primary"}
                    className={className}
                    disabled={disabled}
                    indeterminate={inProgress}
                    onClick={onClick}
                >
                    {icon}
                </IconButtonWithProgress>
            </span>
        )
    else
        return (
            <Button
                aria-label={label}
                title={title}
                size="small"
                variant={transparent ? "outlined" : "contained"}
                color={transparent ? "inherit" : "primary"}
                className={className}
                startIcon={icon}
                disabled={disabled}
                onClick={onClick}
            >
                {title}
            </Button>
        )
}
