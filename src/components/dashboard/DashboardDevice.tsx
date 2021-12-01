import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Typography,
} from "@mui/material"
import React, { useCallback, useRef, useState } from "react"
import {
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_SETTINGS,
    SRV_UNIQUE_BRAIN,
} from "../../../jacdac-ts/src/jdom/constants"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import DeviceName from "../devices/DeviceName"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import DeviceAvatar from "../devices/DeviceAvatar"
import DashboardServiceWidgetItem from "./DashboardServiceWidgetItem"
import DeviceActions from "../devices/DeviceActions"
import useDeviceName from "../devices/useDeviceName"
import { DashboardDeviceProps } from "./Dashboard"
import useIntersectionObserver from "../hooks/useIntersectionObserver"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"
import useMediaQueries from "../hooks/useMediaQueries"
import { DeviceLostAlert } from "../alert/DeviceLostAlert"
import { DeviceProxyAlert } from "../alert/DeviceProxyAlert"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import BarChartIcon from "@mui/icons-material/BarChart"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"

const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_UNIQUE_BRAIN,
]

export default function DashboardDevice(
    props: {
        device: JDDevice
        variant?: "icon" | ""
        charts?: boolean
        setCharts?: (value: boolean) => void
    } & DashboardDeviceProps
) {
    const {
        device,
        serviceFilter,
        variant,
        showAvatar,
        showHeader,
        charts,
        setCharts,
    } = props
    const { xs: mobile } = useMediaQueries()

    const name = useDeviceName(device)
    const specification = useDeviceSpecification(device)
    const services = useChange(device, _ =>
        _?.services({ specification: true }).filter(
            service =>
                ignoredServices.indexOf(service.serviceClass) < 0 &&
                !service.isMixin &&
                (!serviceFilter || serviceFilter(service))
        )
    )
    const sensors = services.filter(srv => isSensor(srv.specification))
    const showChart = !!setCharts && !!sensors.length
    const handleChartChanged = () => setCharts(!charts)

    // refresh when visible
    const serviceGridRef = useRef<HTMLDivElement>()
    const intersection = useIntersectionObserver(serviceGridRef)
    const visible = !!intersection?.isIntersecting

    const ServiceWidgets = useCallback(
        () => (
            <Grid
                ref={serviceGridRef}
                component="div"
                container
                spacing={2}
                justifyContent="center"
                alignItems="flex-end"
                alignContent="space-between"
            >
                {services?.map(service => (
                    <DashboardServiceWidgetItem
                        key={service.id}
                        service={service}
                        services={services}
                        variant={variant}
                        visible={visible}
                        charts={charts}
                    />
                ))}
            </Grid>
        ),
        [dependencyId(services), variant, visible, charts]
    )

    if (!showHeader)
        return (
            <Paper style={{ padding: "0.25em" }} variant="outlined">
                <ServiceWidgets />
            </Paper>
        )

    return (
        <Card aria-live="polite" aria-label={`device ${name} started`}>
            <CardHeader
                style={{ paddingBottom: 0 }}
                avatar={showAvatar && <DeviceAvatar device={device} />}
                action={
                    <DeviceActions
                        device={device}
                        showStop={true}
                        hideIdentity={true}
                        showReset={false}
                        showSettings={false}
                    >
                        {showChart && (
                            <IconButtonWithTooltip
                                title={charts ? "chart mode" : "widget mode"}
                                onClick={handleChartChanged}
                            >
                                <BarChartIcon />
                            </IconButtonWithTooltip>
                        )}
                    </DeviceActions>
                }
                title={<DeviceName showShortId={false} device={device} />}
                subheader={
                    <>
                        {!mobile && specification && (
                            <Typography variant="caption" gutterBottom>
                                {specification.name}
                            </Typography>
                        )}
                    </>
                }
            />
            <CardContent style={{ paddingTop: 0 }}>
                <DeviceLostAlert device={device} />
                <DeviceProxyAlert device={device} />
                <ServiceWidgets />
            </CardContent>
        </Card>
    )
}
