import { Button, styled } from "@mui/material"
import React, { useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useChange from "../../jacdac/useChange"
import SelectRoleDialog from "../dialogs/SelectRoleDialog"
import Suspense from "../ui/Suspense"
import useRoleManagerClient from "./useRoleManagerClient"
import useServiceRole from "./useServiceRole"

const RoleButton = styled(Button)({
    textTransform: "none",
})

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props

    const [showSelectRoleDialog, setShowSelectRoleDialog] = useState(false)
    const roleManager = useRoleManagerClient()
    const role = useServiceRole(service)
    const handleOpen = () => setShowSelectRoleDialog(true)
    const handleClose = () => setShowSelectRoleDialog(false)

    const hasRoleForService = useChange(
        roleManager,
        _ => _?.hasRoleForService(service),
        [service]
    )
    // hide if no role manager or role not compatible with required roles
    if (!hasRoleForService) return null

    return (
        <>
            <RoleButton size="small" onClick={handleOpen}>
                {role || "..."}
            </RoleButton>
            {showSelectRoleDialog && (
                <Suspense>
                    <SelectRoleDialog
                        service={service}
                        onClose={handleClose}
                    />
                </Suspense>
            )}
        </>
    )
}
