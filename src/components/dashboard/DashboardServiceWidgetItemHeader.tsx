import { Grid, Typography } from "@mui/material"
import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import ServiceRole from "../services/ServiceRole"
import useInstanceName from "../services/useInstanceName"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import EditIcon from "@mui/icons-material/Edit"

export default function DashboardServiceWidgetItemHeader(
    props: {
        toggleExpanded: () => void
    } & React.Attributes &
        DashboardServiceProps
): JSX.Element {
    const { service, expanded, toggleExpanded, ...rest } = props
    const instanceName = useInstanceName(service, rest)

    return (
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
