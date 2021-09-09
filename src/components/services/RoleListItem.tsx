import { ListItem, ListItemText } from "@material-ui/core"
import React, { useContext } from "react"
import useChange from "../../jacdac/useChange"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { Role } from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"

export default function RoleListItem(props: {
    role: Role
    selected?: boolean
    onClick?: () => void
}) {
    const { role, selected, onClick } = props
    const { deviceId, serviceIndex, name: roleName } = role
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const bound = useChange(bus, b => b.device(deviceId, true), [deviceId])

    return (
        <ListItem button selected={selected} onClick={onClick}>
            <ListItemText
                primary={roleName || "???"}
                secondary={
                    bound
                        ? `assigned to ${bound.friendlyName}[${serviceIndex}]`
                        : `not assigned`
                }
            />
        </ListItem>
    )
}
