import { Grid, Typography } from "@mui/material"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import useInstanceName from "../services/useInstanceName"
import StatusCodeAlert from "../services/StatusCodeAlert"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service, ...rest } = props
    const instanceName = useInstanceName(service, rest)
    const statusCodeAlert = <StatusCodeAlert service={service} {...rest} />

    return (
        <Grid item>
            <Grid container spacing={1} alignItems="center">
                <Grid item xs>
                    <ServiceRole service={service} />
                </Grid>
                {instanceName && (
                    <Grid item>
                        <Typography
                            className="no-pointer-events"
                            variant="caption"
                            component="span"
                            style={{ float: "right" }}
                        >
                            {instanceName}
                        </Typography>
                    </Grid>
                )}
            </Grid>
            {statusCodeAlert && (
                <Grid item xs={12}>
                    {statusCodeAlert}
                </Grid>
            )}
            <DashboardServiceWidget {...props} />
        </Grid>
    )
}
