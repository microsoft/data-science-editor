import { Grid } from "@material-ui/core"
import React from "react"
import { useId } from "react-use-id-hook"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import GridHeader from "../ui/GridHeader"
import { DashboardDeviceProps } from "./Dashboard"
import DashboardDeviceItem from "./DashboardDeviceItem"

export default function DeviceGroup(
    props: {
        title: string
        action?: JSX.Element
        devices: JDDevice[]
        children?: JSX.Element | JSX.Element[]
    } & DashboardDeviceProps
) {
    const { title, action, devices, children, ...other } = props
    const sectionId = useId()

    if (!action && !devices?.length) return null

    return (
        <section id={sectionId}>
            <Grid container spacing={1}>
                <GridHeader title={title} action={action} />
                {devices?.map(device => (
                    <DashboardDeviceItem
                        key={device.id}
                        device={device}
                        {...other}
                    />
                ))}
                {children}
            </Grid>
        </section>
    )
}
