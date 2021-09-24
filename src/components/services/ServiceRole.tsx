import { Button, styled } from "@material-ui/core"
import React, { useContext } from "react"
import JDService from "../../../jacdac-ts/src/jdom/service"
import useChange from "../../jacdac/useChange"
import AppContext from "../AppContext"
import useRoleManagerClient from "./useRoleManagerClient"
import useServiceRole from "./useServiceRole"

const RoleButton = styled(Button)({
    textTransform: "none",
})

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const { showSelectRoleDialog } = useContext(AppContext)
    const roleManager = useRoleManagerClient()
    const role = useServiceRole(service)
    const handleClick = () => showSelectRoleDialog(service)

    const hasRoleForService = useChange(
        roleManager,
        _ => _?.hasRoleForService(service),
        [service]
    )
    // hide if no role manager or role not compatible with required roles
    if (!hasRoleForService) return null

    return (
        <RoleButton size="small" onClick={handleClick}>
            {role || "..."}
        </RoleButton>
    )
}
