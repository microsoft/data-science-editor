import { Grid, SvgIconProps, Tooltip, Typography } from "@mui/material"
import React, { createElement, Suspense } from "react"
import {
    dashboardServiceIcon,
    DashboardServiceProps,
} from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import useInstanceName from "../services/useInstanceName"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import EditIcon from "@mui/icons-material/Edit"
import { serviceName } from "../../../jacdac-ts/src/jdom/pretty"

export default function DashboardServiceWidgetItemHeader(
    props: {
        toggleExpanded: () => void
    } & React.Attributes &
        DashboardServiceProps
): JSX.Element {
    const { service, expanded, toggleExpanded, ...rest } = props
    const { serviceClass } = service
    const instanceName = useInstanceName(service, rest)
    const icon = dashboardServiceIcon(serviceClass)
    const iconProps: SvgIconProps = {
        titleAccess: serviceName(serviceClass),
        color: "disabled",
    }
    return (
        <Grid container spacing={1} alignItems="center">
            {icon && (
                <Grid item>
                    <Tooltip title={serviceName(serviceClass)}>
                        <Suspense fallback={null}>
                            {createElement(icon, iconProps)}
                        </Suspense>
                    </Tooltip>
                </Grid>
            )}
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
            {expanded !== undefined && (
                <Grid item>
                    <Grid item>
                        <IconButtonWithTooltip
                            size="small"
                            title={
                                expanded
                                    ? "Hide configuration"
                                    : "Show configuration"
                            }
                            onClick={toggleExpanded}
                        >
                            <EditIcon />
                        </IconButtonWithTooltip>
                    </Grid>
                </Grid>
            )}
        </Grid>
    )
}
