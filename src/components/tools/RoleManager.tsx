import React from "react"
import { Grid } from "@material-ui/core"
import { SRV_ROLE_MANAGER } from "../../../jacdac-ts/src/jdom/constants"
import ConnectAlert from "../alert/ConnectAlert"
import Alert from "../ui/Alert"
import RoleManagerService from "../RoleManagerService"
import useServices from "../hooks/useServices"

export default function RoleManager(props: { clearRoles?: boolean }) {
    const { clearRoles } = props;
    const services = useServices({ serviceClass: SRV_ROLE_MANAGER });

    return <>
        {<ConnectAlert serviceClass={SRV_ROLE_MANAGER} />}
        {!services.length && <Alert severity="info">We could not find any device with the role manager service on the bus!</Alert>}
        <Grid container spacing={2}>
            {services.map(service => <Grid key={service.id} item xs={12}>
                <RoleManagerService service={service} clearRoles={clearRoles} />
            </Grid>)}
        </Grid>
    </>
}