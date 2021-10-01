import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Typography,
} from "@material-ui/core"
import React, { useCallback, useRef } from "react"
import {
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_SETTINGS,
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

const ignoredServices = [SRV_CONTROL, SRV_LOGGER, SRV_SETTINGS, SRV_PROTO_TEST]

export default function DashboardDevice(
    props: {
        device: JDDevice
        variant?: "icon" | ""
    } & DashboardDeviceProps
) {
    const { device, serviceFilter, variant, showAvatar, showHeader } = props
    const { xs: mobile } = useMediaQueries()

    const name = useDeviceName(device)
    const specification = useDeviceSpecification(device)
    const services = useChange(device, _ =>
        _?.services({ specification: true }).filter(
            service => ignoredServices.indexOf(service.serviceClass) < 0
        )
    )

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
                {services
                    ?.filter(srv => !srv.isMixin)
                    ?.filter(srv => !serviceFilter || serviceFilter(srv))
                    ?.map(service => (
                        <DashboardServiceWidgetItem
                            key={service.id}
                            service={service}
                            services={services}
                            variant={variant}
                            visible={visible}
                        />
                    ))}
            </Grid>
        ),
        [dependencyId(services), variant, visible]
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
                    />
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
                <ServiceWidgets />
            </CardContent>
        </Card>
    )
}
