import {
    Dialog,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    ListItemText,
} from "@material-ui/core"
import React, { useContext } from "react"
import { useId } from "react-use-id-hook"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useRoleManager from "../services/useRoleManager"
import useChange from "../../jacdac/useChange"
import { Role } from "../../../jacdac-ts/src/jdom/bus"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { serviceName } from "../../../jacdac-ts/src/jdom/pretty"

function RoleListItem(props: {
    role: Role
    currentRole: string
    onClick: () => void
}) {
    const { role, currentRole, onClick } = props
    const { deviceId, serviceIndex, role: roleName } = role
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const bound = useChange(bus, b => b.device(deviceId), [deviceId])

    return (
        <ListItem button selected={currentRole === roleName} onClick={onClick}>
            <ListItemText
                primary={roleName}
                secondary={
                    bound && `bound to ${bound.friendlyName}[${serviceIndex}]`
                }
            />
        </ListItem>
    )
}

export default function SelectRoleDialog(props: {
    service: JDService
    onClose: () => void
}) {
    const { service, onClose } = props
    const { serviceClass } = service
    const open = !!service
    const dialogId = useId()
    const labelId = useId()
    const roleManager = useRoleManager()
    const roles = useChange(roleManager, rm => rm?.compatibleRoles(service), [
        service,
    ])
    const currentRole = useChange(service, srv => srv.role)

    const handleClick = (role: Role) => async () => {
        await roleManager.setRole(service, role.role)
        onClose()
    }

    return (
        <Dialog
            id={dialogId}
            aria-labelledby={labelId}
            open={open}
            onClose={onClose}
        >
            <DialogTitle id={labelId}>
                Select a role this {serviceName(serviceClass)}
            </DialogTitle>
            <DialogContent>
                <List>
                    {roles?.map((role, i) => (
                        <RoleListItem
                            key={i}
                            role={role}
                            currentRole={currentRole}
                            onClick={handleClick(role)}
                        />
                    ))}
                </List>
            </DialogContent>
        </Dialog>
    )
}
