import { Card, CardContent, Grid, Paper } from "@mui/material"
import React, { useCallback, useRef, lazy } from "react"
import {
    SRV_CONTROL,
    SRV_INFRASTRUCTURE,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_SETTINGS,
    SRV_UNIQUE_BRAIN,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import DashboardServiceWidgetItem from "./DashboardServiceWidgetItem"
import useDeviceName from "../devices/useDeviceName"
import { DashboardDeviceProps } from "./Dashboard"
import useIntersectionObserver from "../hooks/useIntersectionObserver"
import { dependencyId } from "../../../jacdac-ts/src/jdom/eventsource"
import { DeviceLostAlert } from "../alert/DeviceLostAlert"
import Suspense from "../ui/Suspense"
import DashboardDeviceCardHeader from "./DashboardDeviceCardHeader"
const DeviceProxyAlert = lazy(() => import("../alert/DeviceProxyAlert"))
const DeviceBootloaderAlert = lazy(
    () => import("../alert/DeviceBootloaderAlert")
)

const ignoredServices = [
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_INFRASTRUCTURE,
    SRV_UNIQUE_BRAIN,
]

export default function DashboardDevice(
    props: {
        device: JDDevice
    } & DashboardDeviceProps
) {
    const {
        device,
        serviceFilter,
        variant,
        showAvatar,
        showHeader,
        showReset,
        showDeviceProxyAlert,
        alwaysVisible,
        controlled,
    } = props

    const name = useDeviceName(device)
    const services = useChange(device, _ =>
        _?.services({ specification: true }).filter(
            service =>
                ignoredServices.indexOf(service.serviceClass) < 0 &&
                !service.isMixin &&
                (!serviceFilter || serviceFilter(service))
        )
    )

    // refresh when visible
    const serviceGridRef = useRef<HTMLDivElement>()
    const intersection = useIntersectionObserver(serviceGridRef)
    const visible =
        alwaysVisible || !intersection || !!intersection.isIntersecting

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
                        key={service.nodeId}
                        service={service}
                        services={services}
                        variant={variant}
                        visible={visible}
                        controlled={controlled}
                    />
                ))}
            </Grid>
        ),
        [dependencyId(services), variant, visible, controlled]
    )

    if (!showHeader)
        return (
            <Paper style={{ padding: "0.25em" }} variant="outlined">
                <ServiceWidgets />
            </Paper>
        )

    return (
        <Card aria-live="polite" aria-label={`device ${name} started`}>
            <DashboardDeviceCardHeader
                device={device}
                showAvatar={showAvatar}
                showReset={showReset}
            />
            <CardContent style={{ paddingTop: 0 }}>
                <DeviceLostAlert device={device} />
                <Suspense fallback={null}>
                    <DeviceBootloaderAlert device={device} />
                </Suspense>
                {showDeviceProxyAlert && (
                    <Suspense>
                        <DeviceProxyAlert device={device} />
                    </Suspense>
                )}
                <ServiceWidgets />
            </CardContent>
        </Card>
    )
}
