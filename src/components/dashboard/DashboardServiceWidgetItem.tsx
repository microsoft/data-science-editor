import { Grid, Typography } from "@material-ui/core"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import useRegister from "../hooks/useRegister"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service } = props
    const instanceNameRegister = useRegister(service, SystemReg.InstanceName)
    const [instanceName] = useRegisterUnpackedValue<[number]>(
        instanceNameRegister,
        props
    )

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
        </Grid>
    )
}
