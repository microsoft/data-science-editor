import { Grid } from "@mui/material"
import {
    SRV_DC_CURRENT_MEASUREMENT,
    SRV_DC_VOLTAGE_MEASUREMENT,
    SRV_POWER_SUPPLY,
    SRV_RELAY,
} from "../../../jacdac-ts/src/jdom/constants"
import React, { useId } from "react"
import useDevices from "../hooks/useDevices"
import { isModuleTester } from "./filters"
import DashboardDevice from "../dashboard/DashboardDevice"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

function powerSupplyServiceFilter(service: JDService) {
    return (
        [
            SRV_POWER_SUPPLY,
            SRV_DC_VOLTAGE_MEASUREMENT,
            SRV_DC_CURRENT_MEASUREMENT,
            SRV_RELAY,
        ].indexOf(service.serviceClass) > -1
    )
}

export default function PowerSupplySection() {
    const sectionId = useId()
    const devices = useDevices({
        serviceClass: SRV_POWER_SUPPLY,
        announced: true,
    }).filter(isModuleTester)
    if (!devices?.length) return null

    return (
        <section id={sectionId}>
            <h2>Power Supply</h2>
            <Grid container spacing={1}>
                {devices.map(device => (
                    <DashboardDevice
                        key={device.nodeId}
                        device={device}
                        serviceFilter={powerSupplyServiceFilter}
                    />
                ))}
            </Grid>
        </section>
    )
}
