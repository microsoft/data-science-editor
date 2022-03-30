import { Grid } from "@mui/material"
import { SRV_POWER_SUPPLY } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import useServices from "../hooks/useServices"
import React from "react"
import DashboardServiceWidgetItem from "../dashboard/DashboardServiceWidgetItem"
import { useId } from "react-use-id-hook"

export default function PowerSupplySection() {
    const sectionId = useId()
    const services = useServices({ serviceClass: SRV_POWER_SUPPLY })
    if (!services?.length) return null

    return (
        <section id={sectionId}>
            <Grid container spacing={1}>
                {services.map(service => (
                    <DashboardServiceWidgetItem
                        key={service.nodeId}
                        service={service}
                        visible={true}
                    />
                ))}
            </Grid>
        </section>
    )
}
