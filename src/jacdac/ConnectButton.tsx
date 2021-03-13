import React from "react"
import { Button } from "gatsby-theme-material-ui"
import {
    ConnectionState,
    JDTransport,
} from "../../jacdac-ts/src/jdom/transport"
import { Badge, useMediaQuery, useTheme } from "@material-ui/core"
import IconButtonWithProgress from "../components/ui/IconButtonWithProgress"
import { MOBILE_BREAKPOINT } from "../components/layout"
import TransportIcon from "../components/icons/TransportIcon"

export default function ConnectButton(props: {
    full?: boolean
    className?: string
    transparent?: boolean
    transport: JDTransport
}) {
    const { full, className, transparent, transport } = props
    const { connectionState, type } = transport
    const theme = useTheme()
    const showDisconnect =
        connectionState == ConnectionState.Connected ||
        connectionState == ConnectionState.Disconnecting
    const inProgress =
        connectionState == ConnectionState.Connecting ||
        connectionState == ConnectionState.Disconnecting
    const small =
        full !== true &&
        (!full || useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT)))
    const disabled =
        connectionState != ConnectionState.Connected &&
        connectionState != ConnectionState.Disconnected
    const onClick = showDisconnect ? () => transport.disconnect() : () => transport.connect()
    const icon = (
        <Badge color="primary" variant="dot" invisible={!showDisconnect}>
            <TransportIcon transport={transport} />
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
