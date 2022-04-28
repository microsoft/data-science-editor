import { Button, styled } from "@mui/material"
import React, { lazy, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { ellipse } from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
import Suspense from "../ui/Suspense"
import useRoleManagerClient from "./useRoleManagerClient"
import useServiceRole from "./useServiceRole"
const SelectRoleDialog = lazy(() => import("../dialogs/SelectRoleDialog"))

const MAX_NAME_LENGTH = 20

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

    const name = ellipse(role, MAX_NAME_LENGTH)
    return (
        <>
            <RoleButton
                title={role || "Choose role for service"}
                size="small"
                onClick={handleOpen}
            >
                {name}
            </RoleButton>
            {showSelectRoleDialog && (
                <Suspense>
                    <SelectRoleDialog service={service} onClose={handleClose} />
                </Suspense>
            )}
        </>
    )
}
