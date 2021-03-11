import { Grid } from "@material-ui/core"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service } = props

    return (
        <Grid item>
            <ServiceRole service={service} />
            <DashboardServiceWidget {...props} />
        </Grid>
    )
}
