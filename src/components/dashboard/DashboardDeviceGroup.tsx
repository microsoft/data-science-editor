import { Grid } from "@material-ui/core";
import React, { } from "react";
import { useId } from "react-use-id-hook";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import GridHeader from "../ui/GridHeader"
import { DashboardDeviceProps } from "./Dashboard";
import DashboardDeviceItem from "./DashboardDeviceItem";

export default function DeviceGroup(props: {
    title: string,
    action?: JSX.Element,
    devices: JDDevice[],
    expanded?: (device: JDDevice) => boolean,
    toggleExpanded?: (device: JDDevice) => void,
    children?: JSX.Element | JSX.Element[]
} & DashboardDeviceProps) {
    const { title, action, devices, expanded, toggleExpanded, children, ...other } = props;
    const handleExpand = (device: JDDevice) => () => toggleExpanded(device)
    const sectionId = useId()

    if (!action && !children)
        return null

    return <section id={sectionId}>
        <Grid container spacing={1}>
            <GridHeader title={title} action={action} />
            {devices?.map(device => <DashboardDeviceItem
                key={device.id}
                device={device}
                expanded={expanded(device)}
                toggleExpanded={handleExpand(device)}
                {...other} />)}
            {children}
        </Grid>
    </section>
}
