import React, { useContext, useEffect, useState } from "react"
import SelectEvent from "../../components/select/SelectEvent"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useDevices from "../../components/hooks/useDevices"
import SelectDevice from "../../components/select/SelectDevice"
import { Grid, Input } from "@material-ui/core"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"
import SelectService from "../../components/select/SelectService"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    HidKeyboardModifiers,
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SystemEvent,
} from "../../../jacdac-ts/src/jdom/constants"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import KeyboardKeyInput, {
    renderKey,
} from "../../components/ui/KeyboardKeyInput"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import AddIcon from "@material-ui/icons/Add"
import DeleteIcon from "@material-ui/icons/Delete"
import SelectServiceGrid from "../../components/select/SelectServiceGrid"
import CmdButton from "../../components/CmdButton"

interface HIDEvent {
    eventId: string
    selector: number
    modifiers: HidKeyboardModifiers
}

function SelectHIDEvent(props: { onAdd: (hidEvent: HIDEvent) => void }) {
    const { onAdd } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [deviceId, setDeviceId] = useState("")
    const [serviceId, setServiceId] = useState("")
    const [eventId, setEventId] = useState("")
    const [selector, setSelector] = useState(0)
    const [modifiers, setModifiers] = useState(HidKeyboardModifiers.None)

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
    const handleKeyChange = (
        newSelector: number,
        newModifiers: HidKeyboardModifiers
    ) => {
        setSelector(newSelector)
        setModifiers(newModifiers)
    }
    const disabled = !eventId || !selector
    const handleAdd = () => {
        onAdd({ eventId, selector, modifiers })
    }

    return (
        <Grid container spacing={1}>
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
            <Grid item xs>
                <KeyboardKeyInput
                    selector={selector}
                    modifiers={modifiers}
                    onChange={handleKeyChange}
                />
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={"Add binding"}
                    disabled={disabled}
                    onClick={handleAdd}
                >
                    <AddIcon />
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}

export default function HIDEvents() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [device, setDevice] = useState<JDDevice>()
    const [hidEvents, setHIDEvents] = useState<HIDEvent[]>([])
    const handleAdd = (hidEvent: HIDEvent) => {
        setHIDEvents([...hidEvents, hidEvent])
    }
    const handleRemoveBinding = (index: number) => () => {
        setHIDEvents([
            ...hidEvents.slice(0, index),
            ...hidEvents.slice(index + 1),
        ])
    }
    const handleSelectHub = (service: JDService) => {}
    const handleSave = async () => {}
    const saveDisabled = !device
    return (
        <>
            <h1>HID Event</h1>
            <h2>Select hub</h2>
            <SelectServiceGrid
                onSelect={handleSelectHub}
                serviceClass={SRV_SETTINGS}
            />
            <h2>Configure keys</h2>
            <SelectHIDEvent onAdd={handleAdd} />
            <Grid container spacing={1}>
                {hidEvents.map(({ eventId, selector, modifiers }, index) => {
                    const event = bus.node(eventId) as JDEvent
                    return (
                        <Grid item xs={12} key={index}>
                            <Grid
                                container
                                direction="row"
                                spacing={1}
                                alignContent="center"
                            >
                                <Grid item xs>
                                    <Input
                                        value={event.friendlyName}
                                        readOnly={true}
                                    />
                                </Grid>
                                <Grid item xs>
                                    <Input
                                        value={renderKey(selector, modifiers)}
                                        readOnly={true}
                                    />
                                </Grid>
                                <Grid item>
                                    <IconButtonWithTooltip
                                        title={"Remove binding"}
                                        onClick={handleRemoveBinding(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButtonWithTooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                })}
            </Grid>
            <h3>Save configuration</h3>
            <CmdButton
                variant="contained"
                color="primary"
                title="Save keys to device"
                onClick={handleSave}
                disabled={saveDisabled}
            >
                Save
            </CmdButton>
        </>
    )
}
