import React from "react"
import { styled } from "@mui/material/styles"
import { Grid } from "@mui/material"
import DeviceCard from "./DeviceCard"
import ServiceCard from "../ServiceCard"
import useGridBreakpoints from "../useGridBreakpoints"
import useDevices from "../hooks/useDevices"
import useServices from "../hooks/useServices"

const PREFIX = "DeviceList"

const classes = {
    root: `${PREFIX}root`,
}

const StyledGrid = styled(Grid)(({ theme }) => ({
    [`&.${classes.root}`]: {
        marginBottom: theme.spacing(1),
    },
}))

export default function DeviceList(props: {
    serviceClass?: number
    linkToService?: boolean
    registerIdentifiers?: number[]
    eventIdentifiers?: number[]
    commandIdentifier?: number
    showServiceName?: boolean
    showMemberName?: boolean
    showTemperature?: boolean
    showFirmware?: boolean
    showServiceButtons?: boolean
}) {
    const {
        serviceClass,
        linkToService,
        registerIdentifiers,
        showServiceName,
        showMemberName,
        showFirmware,
        showTemperature,
        showServiceButtons,
        eventIdentifiers,
        commandIdentifier,
    } = props
    const devices = useDevices({ serviceClass })
    const services = useServices({ serviceClass })

    const hasServiceClass = serviceClass !== undefined
    const gridBreakpoints = useGridBreakpoints(devices?.length)

    return (
        <StyledGrid container spacing={2} className={classes.root}>
            {!hasServiceClass &&
                devices.map(device => (
                    <Grid key={device.id} item {...gridBreakpoints}>
                        <DeviceCard
                            device={device}
                            showDescription={true}
                            showTemperature={showTemperature}
                            showFirmware={showFirmware}
                            showServices={showServiceButtons}
                        />
                    </Grid>
                ))}
            {hasServiceClass &&
                services.map(service => {
                    return (
                        <Grid key={service.nodeId} item {...gridBreakpoints}>
                            <ServiceCard
                                service={service}
                                linkToService={linkToService}
                                showServiceName={showServiceName}
                                showMemberName={showMemberName}
                                registerIdentifiers={registerIdentifiers}
                                eventIdentifiers={eventIdentifiers}
                                commandIdentifier={commandIdentifier}
                            />
                        </Grid>
                    )
                })}
        </StyledGrid>
    )
}
