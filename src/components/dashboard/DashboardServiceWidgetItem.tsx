import { Grid, Typography } from "@material-ui/core"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service } = props
    const [instanceName] = useRegisterUnpackedValue<[number]>(
        service.register(SystemReg.InstanceName),
        props
    )

    return (
        <Grid item>
            <ServiceRole service={service} />
            {instanceName && (
                <Typography
                    className="no-pointer-events"
                    variant="caption"
                    component="span"
                    style={{ float: "right" }}
                >
                    {instanceName}
                </Typography>
            )}
            <DashboardServiceWidget {...props} />
        </Grid>
    )
}
