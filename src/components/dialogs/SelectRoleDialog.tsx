import { Dialog, DialogContent, DialogTitle, List } from "@mui/material"
import React from "react"
import { useId } from "react-use-id-hook"
import JDService from "../../../jacdac-ts/src/jdom/service"
import useRoleManagerClient from "../services/useRoleManagerClient"
import useChange from "../../jacdac/useChange"
import RoleListItem from "../services/RoleListItem"
import { Role } from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"

export default function SelectRoleDialog(props: {
    service: JDService
    onClose: () => void
}) {
    const { service, onClose } = props
    const open = !!service
    const dialogId = useId()
    const labelId = useId()
    const roleManager = useRoleManagerClient()
    const roles = useChange(roleManager, rm => rm?.compatibleRoles(service), [
        service,
    ])
    const currentRole = useChange(service, srv => srv.role)
    const hasRoles = !!roles?.length

    const handleClick = (role: Role) => async () => {
        await roleManager.setRole(service, role.name)
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
                {hasRoles ? `Select a role` : `No role available`}
            </DialogTitle>
            {hasRoles && (
                <DialogContent>
                    <List>
                        {roles?.map(role => (
                            <RoleListItem
                                key={role.name}
                                role={role}
                                selected={currentRole === role.name}
                                onClick={handleClick(role)}
                            />
                        ))}
                    </List>
                </DialogContent>
            )}
        </Dialog>
    )
}
