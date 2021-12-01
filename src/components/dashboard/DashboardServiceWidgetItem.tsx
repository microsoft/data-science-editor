import { Grid, Typography } from "@mui/material"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import useInstanceName from "../services/useInstanceName"
import useChange from "../../jacdac/useChange"
import RegisterTrend from "../RegisterTrend"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service, charts, ...rest } = props
    const instanceName = useInstanceName(service, rest)
    const reading = useChange(service, srv => srv?.readingRegister)

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
            <DashboardServiceWidget {...props} />
            {charts && reading && (
                <Grid item xs={12}>
                    <RegisterTrend register={reading} mini={false} height={18} />
                </Grid>
            )}
        </Grid>
    )
}
