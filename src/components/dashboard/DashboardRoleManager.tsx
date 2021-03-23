import { Grid, List, Switch } from "@material-ui/core"
import React, { useContext } from "react"
import { RoleManagerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useId } from "react-use-id-hook"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import LoadingProgress from "../ui/LoadingProgress"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import { Button } from "gatsby-theme-material-ui"
import useChange from "../../jacdac/useChange"
import { RoleListItem } from "../services/RoleListItem"

export default function DashboardRoleManager(props: DashboardServiceProps) {
    const { service } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const autoBindRegister = service.register(RoleManagerReg.AutoBind)
    const autoBind = useRegisterBoolValue(autoBindRegister, props)
    const handleChecked = async (ev, checked: boolean) => {
        await autoBindRegister.sendSetBoolAsync(checked, true)
    }
    const switchId = useId()
    const labelId = useId()
    const roleManager = useChange(bus, _ => _.roleManager)
    const roles = useChange(roleManager, _ => _?.roles)

    const handleClick = () => roleManager?.startSimulators()

    if (autoBind === undefined) return <LoadingProgress />

    return (
        <>
            {!!roles?.length && (
                <Grid item xs={12}>
                    <List dense={true}>
                        {roles.map(role => (
                            <RoleListItem key={role.name} role={role} />
                        ))}
                    </List>
                </Grid>
            )}
            <Grid item xs={12}>
                <Switch
                    id={switchId}
                    checked={autoBind}
                    onChange={handleChecked}
                    aria-labelledby={labelId}
                />
                <label id={labelId}>auto assign roles</label>
            </Grid>
            <Grid item xs={12}>
                <Button
                    disabled={!roleManager}
                    variant="outlined"
                    onClick={handleClick}
                >
                    Start simulators
                </Button>
            </Grid>
        </>
    )
}
