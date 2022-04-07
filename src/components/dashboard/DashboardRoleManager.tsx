import { Grid, Switch } from "@mui/material"
import React from "react"
import { RoleManagerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useId } from "react"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useChange from "../../jacdac/useChange"
import RoleListItem from "../services/RoleListItem"
import useRegister from "../hooks/useRegister"
import useRoleManagerClient from "../services/useRoleManagerClient"

export default function DashboardRoleManager(props: DashboardServiceProps) {
    const { service, expanded } = props
    const autoBindRegister = useRegister(service, RoleManagerReg.AutoBind)
    const autoBind = useRegisterBoolValue(autoBindRegister, props)
    const handleChecked = async (ev, checked: boolean) =>
        await autoBindRegister.sendSetBoolAsync(checked, true)
    const switchId = useId()
    const labelId = switchId + "-label"
    const roleManager = useRoleManagerClient()
    const roles = useChange(roleManager, _ => _?.roles)

    return (
        <>
            {roles && (
                <Grid item xs={12}>
                    <Grid container spacing={1} direction="row">
                        {roles.map(role => (
                            <Grid key={role.name} item xs>
                                <RoleListItem role={role} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            )}
            {expanded && autoBind !== undefined && (
                <Grid item xs={12}>
                    <Switch
                        id={switchId}
                        checked={autoBind}
                        onChange={handleChecked}
                    />
                    <label id={labelId} htmlFor={switchId}>
                        auto assign roles
                    </label>
                </Grid>
            )}
        </>
    )
}
