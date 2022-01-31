import React, { useContext } from "react"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import TransportIcon from "../icons/TransportIcon"
import ConsoleContext from "./ConsoleContext"
import { IconButtonProps } from "@mui/material"

export default function ConsoleSerialButton(props: IconButtonProps) {
    const { ...rest } = props
    const { connected, connect, disconnect } = useContext(ConsoleContext)
    if (!connect) return null

    const handleClick = connected ? disconnect : connect
    return (
        <IconButtonWithTooltip
            onClick={handleClick}
            selected={connected}
            title={
                connected
                    ? `connected to serial console`
                    : "serial console disconnected"
            }
            {...rest}
        >
            <TransportIcon type="serial" />
        </IconButtonWithTooltip>
    )
}
