import { Dialog, DialogContent, DialogTitle, List } from "@material-ui/core"
import React from "react"
import { useId } from "react-use-id-hook"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useRoleManager from "../services/useRoleManager"
import useChange from "../../jacdac/useChange"
import { RoleListItem } from "../services/RoleListItem"
import { Role } from "../../../jacdac-ts/src/jdom/rolemanagerclient"

export default function SelectRoleDialog(props: {
    service: JDService
    onClose: () => void
}) {
    const { service, onClose } = props
    const open = !!service
    const dialogId = useId()
    const labelId = useId()
    const roleManager = useRoleManager()
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
                        {roles?.map((role, i) => (
                            <RoleListItem
                                key={i}
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
