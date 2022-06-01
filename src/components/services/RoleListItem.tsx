import { ListItem, ListItemText } from "@mui/material"
import React, { useContext } from "react"
import useChange from "../../jacdac/useChange"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { Role } from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"
import { isDeviceId, shortDeviceId } from "../../../jacdac-ts/src/jdom/pretty"

export default function RoleListItem(props: {
    role: Role
    selected?: boolean
    onClick?: () => void
}) {
    const { role, selected, onClick } = props
    const { deviceId, serviceIndex, name: roleName = "???" } = role
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const bound = useChange(bus, b => b.device(deviceId, true), [deviceId])

    const name = isDeviceId(roleName) ? shortDeviceId(roleName) : roleName
    return (
        <ListItem button selected={selected} onClick={onClick}>
            <ListItemText
                primary={name}
                secondary={
                    bound
                        ? `bound to ${bound.friendlyName}[${serviceIndex}]`
                        : `...`
                }
            />
        </ListItem>
    )
}
