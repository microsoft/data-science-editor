import { Grid } from "@material-ui/core"
import React from "react"
import { RoleManagerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import CmdButton from "../CmdButton"

export default function DashboardRoleManager(props: DashboardServiceProps) {
    const { service } = props
    const autoBindRegister = service.register(RoleManagerReg.AutoBind)
    const handleAutoBind = async () =>
        await autoBindRegister.sendSetBoolAsync(true, true)

    return (
        <Grid item xs={12}>
            <CmdButton
                onClick={handleAutoBind}
                variant="outlined"
                title="bind roles to services automatically"
            >
                Assign roles
            </CmdButton>
        </Grid>
    )
}
