import React from "react"
import useChange from "../../jacdac/useChange"
import { Grid } from "@mui/material"
import RoleChip from "./RoleChip"
import {
    Role,
    resolveRoleService,
} from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"
import useRoleManagerClient from "../services/useRoleManagerClient"
import useBus from "../../jacdac/useBus"

export default function RoleChipItems(props: {
    onRoleClick: (role: Role) => void
}) {
    const { onRoleClick } = props
    const bus = useBus()
    const roleManager = useRoleManagerClient()
    const roles = useChange(roleManager, _ => _?.roles)

    const handleClick = (role: Role) => () => onRoleClick(role)

    return (
        <>
            {roles?.map((role, i) => (
                <Grid item key={i}>
                    <RoleChip
                        role={role.name}
                        service={resolveRoleService(bus, role)}
                        serviceClass={role.serviceClass}
                        onClick={handleClick(role)}
                    />
                </Grid>
            ))}
        </>
    )
}
