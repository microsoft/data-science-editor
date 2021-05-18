import React, { useContext, useState } from "react"
import SelectEvent from "../../components/select/SelectEvent"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useDevices from "../../components/hooks/useDevices"
import SelectDevice from "../../components/select/SelectDevice"
import { Grid, Typography } from "@material-ui/core"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import SelectService from "../../components/select/SelectService"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SystemEvent,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"

export default function HIDEvents() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [deviceId, setDeviceId] = useState("")
    const [serviceId, setServiceId] = useState("")
    const [eventId, setEventId] = useState("")

    const excludedServices = [
        SRV_CONTROL,
        SRV_PROTO_TEST,
        SRV_ROLE_MANAGER,
        SRV_SETTINGS,
        SRV_LOGGER,
    ]
    const eventFilter = (ev: JDEvent) =>
        ev.code !== SystemEvent.StatusCodeChanged
    const devices = useDevices({ ignoreSelf: true })
    const device = bus.node(deviceId) as JDDevice
    const services = useChange(device, _ =>
        _?.services({ specification: true })
            .filter(srv => excludedServices.indexOf(srv.serviceClass) < 0)
            .filter(srv => srv.events.some(eventFilter))
    )
    const service = bus.node(serviceId) as JDService
    const events = useChange(service, _ => _?.events.filter(eventFilter))

    const handleDeviceChange = (deviceId: string) => {
        setDeviceId(deviceId)
        setServiceId("")
        setEventId("")
    }
    const handleServiceChange = (serviceId: string) => {
        setServiceId(serviceId)
        setEventId("")
    }
    const handleEventChange = (id: string) => setEventId(id)

    return (
        <>
            <h1>HID Event</h1>
            <Grid container spacing={1}>
                <Grid item xs={12}>
                    <Typography variant="h2">Choose an event</Typography>
                </Grid>
                <Grid item>
                    <SelectDevice
                        devices={devices}
                        deviceId={deviceId}
                        onChange={handleDeviceChange}
                    />
                </Grid>
                <Grid item>
                    <SelectService
                        services={services}
                        serviceId={serviceId}
                        onChange={handleServiceChange}
                    />
                </Grid>
                <Grid item>
                    <SelectEvent
                        events={events}
                        eventId={eventId}
                        onChange={handleEventChange}
                    />
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="h2">
                        Choose a keyboard combo
                    </Typography>
                </Grid>
                <Grid item></Grid>
            </Grid>
        </>
    )
}
