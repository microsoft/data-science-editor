import { Grid, Switch } from "@material-ui/core"
import React from "react"
import { RoleManagerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useId } from "react-use-id-hook"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import LoadingProgress from "../ui/LoadingProgress"

export default function DashboardRoleManager(props: DashboardServiceProps) {
    const { service } = props
    const autoBindRegister = service.register(RoleManagerReg.AutoBind)
    const autoBind = useRegisterBoolValue(autoBindRegister, props)
    const handleChecked = async (ev, checked: boolean) => {
        await autoBindRegister.sendSetBoolAsync(checked, true)
    }
    const switchId = useId()
    const labelId = useId()

    if (autoBind === undefined)
        return <LoadingProgress />

    return (
        <Grid item xs={12}>
            <Switch
                id={switchId}
                checked={autoBind}
                onChange={handleChecked}
                aria-labelledby={labelId}
            />
            <label id={labelId}>auto assign roles</label>
        </Grid>
    )
}
