import { Grid } from "@mui/material"
import React, { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import DashboardDevice from "./DashboardDevice"
import { GridBreakpoints } from "../useGridBreakpoints"
import { DashboardDeviceProps } from "./Dashboard"
import useChange from "../../jacdac/useChange"
import { dashboardServiceWeight } from "./DashboardServiceWidget"
import AppContext, { DrawerType } from "../AppContext"

export default function DashboardDeviceItem(
    props: {
        device: JDDevice
        variant?: "icon" | ""
        alwaysVisbile?: boolean
    } & DashboardDeviceProps
) {
    const { device, variant, ...other } = props
    const { drawerType } = useContext(AppContext)
    const breakpoints: GridBreakpoints = useChange(
        device,
        () => {
            const breakpointWeight = device
                .services()
                .map(srv => {
                    return (
                        dashboardServiceWeight(srv) ||
                        (srv.readingRegister ||
                        srv.valueRegister ||
                        srv.intensityRegister
                            ? 1
                            : 0)
                    )
                })
                .reduce((c: number, v) => c + v, 0)

            if (breakpointWeight > 3 || drawerType !== DrawerType.None)
                return { xs: 12, sm: 12, md: 12, lg: 6, xl: 6 }
            else if (breakpointWeight == 3)
                return { xs: 12, sm: 12, md: 4, lg: 4, xl: 4 }
            else if (breakpointWeight == 2)
                return { xs: 12, sm: 6, md: 4, lg: 3, xl: 4 }
            else
                return {
                    xs: 6,
                    sm: 4,
                    md: 3,
                    lg: 2,
                    xl: "auto",
                }
        },
        [drawerType]
    )

    // based on size, expanded or reduce widget size
    return (
        <Grid item {...breakpoints}>
            <DashboardDevice device={device} variant={variant} {...other} />
        </Grid>
    )
}
