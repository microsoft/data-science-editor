import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Typography,
} from "@material-ui/core"
import React, { useCallback, useEffect, useRef } from "react"
import {
    RESTART,
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_SETTINGS,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import DeviceName from "../devices/DeviceName"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import ExpandLessIcon from "@material-ui/icons/ExpandLess"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import DeviceAvatar from "../devices/DeviceAvatar"
import DashboardServiceWidgetItem from "./DashboardServiceWidgetItem"
import DeviceActions from "../DeviceActions"
import DashboardServiceDetails from "./DashboardServiceDetails"
import useDeviceName from "../devices/useDeviceName"
import { DashboardDeviceProps } from "./Dashboard"
import useIntersectionObserver from "../hooks/useIntersectionObserver"
import { dependencyId } from "../../../jacdac-ts/src/jdom/node"
import useMediaQueries from "../hooks/useMediaQueries"
import { useSnackbar } from "notistack"

const ignoredServices = [SRV_CONTROL, SRV_LOGGER, SRV_SETTINGS, SRV_PROTO_TEST]

export default function DashboardDevice(
    props: {
        device: JDDevice
        expanded?: boolean
        toggleExpanded?: () => void
        variant?: "icon" | ""
    } & DashboardDeviceProps
) {
    const {
        device,
        serviceFilter,
        expanded,
        toggleExpanded,
        variant,
        showAvatar,
        showHeader,
    } = props
    const name = useDeviceName(device)
    const services = useChange(device, () =>
        device
            .services({ specification: true })
            .filter(
                service => ignoredServices.indexOf(service.serviceClass) < 0
            )
    )
    const specification = useDeviceSpecification(device)
    const { xs: mobile } = useMediaQueries()
    const serviceGridRef = useRef<HTMLDivElement>()
    const intersection = useIntersectionObserver(serviceGridRef)
    const visible = !!intersection?.isIntersecting
    const { enqueueSnackbar } = useSnackbar()

    useEffect(() =>
        device?.subscribe(RESTART, () => {
            console.debug(`${device.shortId} restarted...`)
            enqueueSnackbar(`${device.shortId} restarted...`, {
                variant: "warning",
            })
        })
    )

    const ServiceWidgets = useCallback(
        () => (
            <Grid
                ref={serviceGridRef}
                component="div"
                container
                spacing={2}
                justify="center"
                alignItems="flex-end"
                alignContent="space-between"
            >
                {services
                    ?.filter(srv => expanded || !srv.isMixin)
                    ?.filter(srv => !serviceFilter || serviceFilter(srv))
                    ?.map(service => (
                        <DashboardServiceWidgetItem
                            key={service.id}
                            service={service}
                            expanded={expanded}
                            services={services}
                            variant={variant}
                            visible={visible}
                        />
                    ))}
            </Grid>
        ),
        [dependencyId(services), expanded, variant, visible]
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
                        showStop={expanded}
                        hideIdentity={!expanded}
                        showReset={expanded && !mobile}
                        showSettings={expanded && !mobile}
                    >
                        {toggleExpanded && (
                            <IconButtonWithTooltip
                                onClick={toggleExpanded}
                                title={expanded ? "Collapse" : "Expand"}
                            >
                                {expanded ? (
                                    <ExpandLessIcon />
                                ) : (
                                    <ExpandMoreIcon />
                                )}
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
                <ServiceWidgets />
                {expanded && (
                    <Grid
                        container
                        direction="column"
                        spacing={1}
                        alignContent="stretch"
                    >
                        {services?.map(service => (
                            <DashboardServiceDetails
                                key={"details" + service.serviceIndex}
                                service={service}
                                services={services}
                                expanded={expanded}
                                variant={variant}
                                visible={visible}
                            />
                        ))}
                    </Grid>
                )}
            </CardContent>
        </Card>
    )
}
