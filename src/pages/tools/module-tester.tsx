import { Grid } from "@mui/material"
import React from "react"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import useDevices from "../../components/hooks/useDevices"

export default function Page() {
    const devices = useDevices({
        physical: true,
        announced: true,
        ignoreInfrastructure: true,
    }).sort((l, r) => -(l.created - r.created))
    const device = devices[0]
    console.log({ devices, device })

    return (
        <>
            <h1>Module Tester</h1>
            <p>Only the last connected module is shown on this view.</p>
            <Grid container spacing={1}>
                {device && (
                    <DashboardDeviceItem
                        key={device.id}
                        device={device}
                        showAvatar={true}
                        showHeader={true}
                    />
                )}
            </Grid>
        </>
    )
}
