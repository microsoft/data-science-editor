import { Badge } from "@mui/material"
import React from "react"
import JacdacIcon from "../icons/JacdacIcon"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import useDeviceCount from "../hooks/useDeviceCount"

export default function OpenDashboardButton(props: { className?: string }) {
    const { className } = props
    const count = useDeviceCount({ ignoreInfrastructure: true })

    return (
        <IconButtonWithTooltip
            trackName="menu.dashboard"
            className={className}
            title="Device Dashboard"
            edge="start"
            color="inherit"
            to="/dashboard/"
        >
            <Badge color="secondary" badgeContent={count}>
                <JacdacIcon />
            </Badge>
        </IconButtonWithTooltip>
    )
}
