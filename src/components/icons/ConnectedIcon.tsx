import React from "react"
import { Tooltip } from "@mui/material"
import NotInterestedIcon from "@mui/icons-material/NotInterested"
import CircleIcon from "@mui/icons-material/Circle"

export default function ConnectedIcon(props: {
    connected: boolean
    tooltip?: boolean
}) {
    const { connected, tooltip, ...other } = props
    let res = connected ? (
        <CircleIcon color="success" {...other} />
    ) : (
        <NotInterestedIcon color="disabled" {...other} />
    )
    if (tooltip)
        res = (
            <Tooltip title={connected ? "connected" : "disconnected"}>
                {res}
            </Tooltip>
        )
    return res
}
