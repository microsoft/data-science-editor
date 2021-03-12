import { Button, Typography } from "@material-ui/core"
import React, { useContext } from "react"
import { SystemReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import AppContext from "../AppContext"
import useRoleManager from "./useRoleManager"
import useServiceRole from "./useServiceRole"
import { useRegisterStringValue } from "../../jacdac/useRegisterValue"

export default function ServiceRole(props: { service: JDService }) {
    const { service } = props
    const { showSelectRoleDialog } = useContext(AppContext)
    const roleManager = useRoleManager()
    const role = useServiceRole(service)
    const hasRoles = roleManager?.hasRoleForService(service)
    const instanceName = useRegisterStringValue(
        service.register(SystemReg.InstanceName)
    )
    const handleClick = () => showSelectRoleDialog(service)

    // hide if no role manager or role not compatible with required roles
    if (!hasRoles && !instanceName) return null

    // just the instance name
    if (!role && instanceName)
        return <Typography variant="caption">{instanceName}</Typography>

    return (
        <Button size="small" onClick={handleClick}>
            {role || "..."}
            {instanceName && (
                <Typography variant="caption">({instanceName})</Typography>
            )}
        </Button>
    )
}
