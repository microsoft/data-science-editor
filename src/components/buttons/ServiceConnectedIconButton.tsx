import React, { MouseEventHandler } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import ConnectedIcon from "../icons/ConnectedIcon"

export default function ServiceConnectedIconButton(props: {
    connected: boolean
    onClick: MouseEventHandler<HTMLButtonElement>
}) {
    const { connected, onClick, ...other } = props
    return (
        <IconButtonWithTooltip
            title={connected ? "connected" : "disconnected"}
            onClick={onClick}
            {...other}
        >
            <ConnectedIcon connected={connected} />
        </IconButtonWithTooltip>
    )
}
