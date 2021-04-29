import { Grid, Typography } from "@material-ui/core"
import React from "react"
import DashboardServiceWidget, {
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import useServiceServer from "../hooks/useServiceServer"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import CloseIcon from "@material-ui/icons/Close"

export default function DashboardServiceWidgetItem(
    props: React.Attributes & DashboardServiceProps
): JSX.Element {
    const { service, expanded } = props
    const { isMixin } = service
    const [instanceName] = useRegisterUnpackedValue<[number]>(
        service.register(SystemReg.InstanceName),
        props
    )
    const server = useServiceServer(service)

    const handleRemove = () => server?.device.removeService(server)

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
                {expanded && !isMixin && server && (
                    <Grid item xs>
                        <IconButtonWithTooltip
                            title="Remove service"
                            onClick={handleRemove}
                        >
                            <CloseIcon />
                        </IconButtonWithTooltip>
                    </Grid>
                )}
            </Grid>
            <DashboardServiceWidget {...props} />
        </Grid>
    )
}
