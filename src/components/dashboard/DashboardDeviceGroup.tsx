import { Grid } from "@mui/material"
import { styled } from "@mui/material/styles"
import React from "react"
import { useId } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import GridHeader from "../ui/GridHeader"
import { DashboardDeviceProps } from "./Dashboard"
import DashboardDeviceItem from "./DashboardDeviceItem"

const StyledSection = styled("section")(({ theme }) => ({
    marginBottom: theme.spacing(1),
}))

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
        <StyledSection id={sectionId}>
            <Grid container spacing={1}>
                <GridHeader title={title} action={action} />
                {children}
                {devices?.map(device => (
                    <DashboardDeviceItem
                        key={device.id}
                        device={device}
                        {...other}
                    />
                ))}
            </Grid>
        </StyledSection>
    )
}
