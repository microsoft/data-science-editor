import {
    Card,
    CardContent,
    CardHeader,
    Grid,
    Paper,
    Typography,
    useMediaQuery,
    useTheme,
} from "@material-ui/core"
import React, { useCallback, useRef } from "react"
import { SRV_CTRL, SRV_LOGGER } from "../../../jacdac-ts/src/jdom/constants"
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
import { MOBILE_BREAKPOINT } from "../layout"
import useDeviceName from "../devices/useDeviceName"
import { DashboardDeviceProps } from "./Dashboard"
import useIntersectionObserver from "../hooks/useIntersectionObserver"
import { dependencyId } from "../../../jacdac-ts/src/jdom/node"

const ignoredServices = [SRV_CTRL, SRV_LOGGER]

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
    const theme = useTheme()
    const mobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT))
    const serviceGridRef = useRef<HTMLDivElement>()
    const intersection = useIntersectionObserver(serviceGridRef)
    const visible = !!intersection?.isIntersecting

    console.log({ services })
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
                        hideIdentity={true}
                        showReset={expanded && !mobile}
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
