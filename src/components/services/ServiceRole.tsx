import { Button, styled } from "@mui/material"
import React, { lazy, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { ellipse } from "../../../jacdac-ts/src/jdom/utils"
import useChange from "../../jacdac/useChange"
import Suspense from "../ui/Suspense"
import useRoleManagerClient from "./useRoleManagerClient"
import useServiceRole from "./useServiceRole"
const SelectRoleDialog = lazy(() => import("../dialogs/SelectRoleDialog"))

const MAX_NAME_LENGTH = 16
const MIN_CHAR_FIRST_WORD = 3
const ELLIPSE = "…"

const RoleButton = styled(Button)({
    textTransform: "none",
})

function renderRoleName(role: string) {
    let n = role || ELLIPSE
    const overflow = n.length - MAX_NAME_LENGTH
    if (overflow >= 0) {
        const parts = n.split(/\s+/g)
        const first =
            parts[0].slice(
                0,
                Math.max(
                    MIN_CHAR_FIRST_WORD,
                    parts[0].length - overflow - ELLIPSE.length - 2
                )
            ) + ELLIPSE
        if (parts[0].length > first.length) parts[0] = first
        n = parts.join(" ")
    }
    return ellipse(n, MAX_NAME_LENGTH, ELLIPSE)
}

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

    const name = renderRoleName(role)
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
