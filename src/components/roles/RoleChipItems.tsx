import React from "react"
import useChange from "../../jacdac/useChange"
import { Grid } from "@mui/material"
import RoleChip from "./RoleChip"
import {
    RoleManager,
    RoleBinding,
} from "../../../jacdac-ts/src/jdom/rolemanager"

export default function RoleChipItems(props: {
    roleManager: RoleManager
    onRoleClick: (role: RoleBinding) => void
}) {
    const { roleManager, onRoleClick } = props
    const roles = useChange(roleManager, _ => _?.roles())

    const handleClick = (role: RoleBinding) => () => onRoleClick(role)

    return (
        <>
            {roles?.map(binding => (
                <Grid item key={binding.role}>
                    <RoleChip
                        role={binding.role}
                        service={binding.service}
                        serviceClass={binding.serviceClass}
                        preferredDeviceId={binding.preferredDeviceId}
                        onClick={handleClick(binding)}
                    />
                </Grid>
            ))}
        </>
    )
}
