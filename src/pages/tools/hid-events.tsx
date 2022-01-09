import React, {
    lazy,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import {
    Card,
    CardActions,
    CardContent,
    Dialog,
    DialogContent,
    Grid,
    Typography,
} from "@mui/material"
import useChange from "../../jacdac/useChange"
import JDService from "../../../jacdac-ts/src/jdom/service"
import {
    HidKeyboardModifiers,
    SRV_CONTROL,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SystemEvent,
} from "../../../jacdac-ts/src/jdom/constants"
import JDEvent from "../../../jacdac-ts/src/jdom/event"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import DeleteIcon from "@mui/icons-material/Delete"
import SettingsClient from "../../../jacdac-ts/src/jdom/clients/settingsclient"
import useServiceClient from "../../components/useServiceClient"
import {
    arrayConcatMany,
    clone,
    fromHex,
    toHex,
} from "../../../jacdac-ts/src/jdom/utils"
import { jdpack, jdunpack } from "../../../jacdac-ts/src/jdom/pack"
import { randomDeviceId } from "../../../jacdac-ts/src/jdom/random"
import JDBus from "../../../jacdac-ts/src/jdom/bus"
import useServices from "../../components/hooks/useServices"
import { Button } from "gatsby-theme-material-ui"
import Alert from "../../components/ui/Alert"
import GridHeader from "../../components/ui/GridHeader"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import ConnectAlert from "../../components/alert/ConnectAlert"
import DeviceCardHeader from "../../components/devices/DeviceCardHeader"
import useGridBreakpoints from "../../components/useGridBreakpoints"
import Suspense from "../../components/ui/Suspense"
import useServiceProviderFromServiceClass from "../../components/hooks/useServiceProviderFromServiceClass"
import AppContext from "../../components/AppContext"
import { AlertTitle } from "@mui/material"
import { renderKeyboardKey } from "../../../jacdac-ts/src/servers/hidkeyboardserver"
import DialogTitleWithClose from "../../components/ui/DialogTitleWithClose"
const ImportButton = lazy(() => import("../../components/ImportButton"))
const KeyboardKeyInput = lazy(() => import("../../components/ui/KeyboardKeyInput"))

// all settings keys are prefixed with this string
const PREFIX = "@ke_"
// data layout format (18bytes)
const FORMAT = "b[8] u32 u8 u8 u16 u16"
// data layout types
type FORMAT_TYPE = [Uint8Array, number, number, number, number, number]

interface HIDEvent {
    key?: string
    eventId: string
    selector: number
    modifiers: HidKeyboardModifiers
}

function HIDEventToBuffer(event: JDEvent, ev: HIDEvent) {
    const deviceId = fromHex(event.service.device.deviceId)
    const { service, code } = event
    const { serviceClass, serviceIndex } = service
    const { selector, modifiers } = ev
    const payload = jdpack<FORMAT_TYPE>(FORMAT, [
        deviceId,
        serviceClass,
        serviceIndex,
        code,
        selector,
        modifiers,
    ])
    return payload
}

function bufferToHIDEvent(key: string, data: Uint8Array, bus: JDBus): HIDEvent {
    if (data?.length !== 18) return undefined
    const [
        deviceId,
        serviceClass,
        serviceIndex,
        eventCode,
        selector,
        modifiers,
    ] = jdunpack<FORMAT_TYPE>(data, FORMAT)
    const deviceIds = toHex(deviceId)
    const device = bus.device(deviceIds, true)
    const event = device?.service(serviceIndex)?.event(eventCode)

    if (!event || event.service.serviceClass !== serviceClass) return undefined
    return {
        key,
        eventId: event.id,
        selector,
        modifiers,
    }
}

function SelectHIDEvent(props: { onAdd: (hidEvent: HIDEvent) => void }) {
    const { onAdd } = props
    const [event, setEvent] = useState<JDEvent>()
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
    const services = useServices({
        ignoreInfrastructure: true,
        specification: true,
    })
        .filter(srv => excludedServices.indexOf(srv.serviceClass) < 0)
        .filter(srv => srv.events.some(eventFilter))
    const events = arrayConcatMany(
        services.map(service => service.events.filter(eventFilter))
    )

    const handleClickEvent = (newEvent: JDEvent) => () =>
        setEvent(event === newEvent ? undefined : newEvent)

    const handleKeyChange = (
        newSelector: number,
        newModifiers: HidKeyboardModifiers
    ) => {
        setSelector(newSelector)
        setModifiers(newModifiers)
    }
    const disabled = !event || !selector
    const handleAdd = () => onAdd({ eventId: event.id, selector, modifiers })

    return (
        <Grid container spacing={2}>
            {!events?.length && (
                <Grid item xs={12}>
                    <Alert severity="info">
                        Connect your devices to bind keyboard commands.
                    </Alert>
                </Grid>
            )}
            {events
                .filter(ev => !event || ev === event)
                .map(ev => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={ev.id}>
                        <Card>
                            <DeviceCardHeader
                                device={ev.service.device}
                                showAvatar={true}
                            />
                            <CardContent>
                                <Typography variant="h5">
                                    {ev.service.name}
                                </Typography>
                                <Typography variant="h4">
                                    {humanify(ev.name)}
                                </Typography>
                            </CardContent>
                            <CardActions>
                                <Button
                                    onClick={handleClickEvent(ev)}
                                    variant={"outlined"}
                                >
                                    {ev === event ? "unselect" : "select"}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            {event && (
                <>
                    <GridHeader title="Enter your keyboard/mouse command" />
                    <Grid item xs={12}>
                        <Suspense>
                            <KeyboardKeyInput
                                selector={selector}
                                modifiers={modifiers}
                                onChange={handleKeyChange}
                            />
                        </Suspense>
                    </Grid>
                </>
            )}
            {!disabled && (
                <>
                    <GridHeader title="Save your binding" />
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={disabled}
                            onClick={handleAdd}
                        >
                            Save binding
                        </Button>
                    </Grid>
                </>
            )}
        </Grid>
    )
}

export default function HIDEvents() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const settingsServices = useServices({ serviceClass: SRV_SETTINGS })
    const [settingsService, setSettingsService] = useState<JDService>()
    const [hidEvents, setHIDEvents] = useState<HIDEvent[]>([])
    const [open, setOpen] = useState(false)
    const gridBreakpoints = useGridBreakpoints()
    const exportRef = useRef()

    const handleOpenAdd = () => setOpen(true)
    const handleCloseAdd = () => setOpen(false)

    const factory = useCallback(srv => new SettingsClient(srv), [])
    const settings = useServiceClient(settingsService, factory)

    useServiceProviderFromServiceClass(SRV_SETTINGS)
    useChange(settings, async () => {
        const hes: HIDEvent[] = []
        if (settings) {
            const all = await settings.list()
            for (const kv of all.filter(entry =>
                entry.key?.startsWith(PREFIX)
            )) {
                const { key, value } = kv
                const he = bufferToHIDEvent(key, value, bus)
                if (he) hes.push(he)
            }
        }
        if (JSON.stringify(hes) !== JSON.stringify(hidEvents)) setHIDEvents(hes)
    })
    const handleAdd = async (hidEvent: HIDEvent) => {
        setOpen(false)

        const event = bus.node(hidEvent.eventId) as JDEvent
        if (!event) return

        const payload = HIDEventToBuffer(event, hidEvent)
        settings.setValue(PREFIX + randomDeviceId(), payload)
    }
    const handleRemoveBinding = (index: number) => () => {
        const { key } = hidEvents[index]
        if (key) settings.deleteValue(key)
    }
    const handleSelectSettingsService = (service: JDService) => () =>
        setSettingsService(settingsService === service ? undefined : service)

    const exportUri =
        hidEvents &&
        `data:application/json;charset=UTF-8,${encodeURIComponent(
            JSON.stringify(
                clone(hidEvents).map(h => {
                    delete h.key
                    return h
                })
            )
        )}`
    useEffect(() => {
        if (exportRef.current)
            (exportRef.current as HTMLAnchorElement).download = "bindings.json"
    }, [exportRef.current])
    const handleFilesUploaded = async (files: File[]) => {
        for (const file of files) {
            try {
                const text = await file.text()
                const json = JSON.parse(text)
                if (Array.isArray(json)) {
                    for (const hidEvent of json as HIDEvent[]) {
                        const event = bus.node(hidEvent.eventId) as JDEvent
                        if (event) {
                            const payload = HIDEventToBuffer(event, hidEvent)
                            settings.setValue(
                                PREFIX + randomDeviceId(),
                                payload
                            )
                        }
                    }
                }
            } catch (e) {
                console.warn(e)
                setError(`invalid file ${file.name}`)
            }
        }
    }
    return (
        <>
            <h1>Accessibility Adapter</h1>
            <Grid container spacing={1}>
                <GridHeader title="Select an adapter" />
                {!settingsServices?.length && (
                    <Grid item xs>
                        <ConnectAlert serviceClass={SRV_SETTINGS} />
                    </Grid>
                )}
                {settingsServices
                    .filter(srv => !settingsService || srv === settingsService)
                    .map(srv => (
                        <Grid item key={srv.id} {...gridBreakpoints}>
                            <Card>
                                <DeviceCardHeader
                                    device={srv.device}
                                    showAvatar={true}
                                    showMedia={true}
                                />
                                <CardActions>
                                    <Button
                                        variant={"outlined"}
                                        onClick={handleSelectSettingsService(
                                            srv
                                        )}
                                    >
                                        {settingsService === srv
                                            ? "unselect"
                                            : "select"}
                                    </Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                {settings && (
                    <>
                        <GridHeader title="Command Bindings" />
                        {!hidEvents?.length && (
                            <Grid item xs>
                                <Alert severity="info">
                                    No bindings yet! Click{" "}
                                    <strong>Add binding</strong> to start
                                    building your adapter.
                                </Alert>
                            </Grid>
                        )}
                        {hidEvents
                            ?.map(({ eventId, selector, modifiers }) => ({
                                eventId,
                                event: bus.node(eventId) as JDEvent,
                                selector,
                                modifiers,
                            }))
                            .map(
                                (
                                    { eventId, event, selector, modifiers },
                                    index
                                ) => (
                                    <Grid
                                        item
                                        {...gridBreakpoints}
                                        key={eventId}
                                    >
                                        <Card>
                                            <DeviceCardHeader
                                                device={event?.service.device}
                                                showAvatar={true}
                                            />
                                            <CardContent>
                                                {event ? (
                                                    <Typography variant="h6">
                                                        {`${
                                                            event.service.name
                                                        } ${humanify(
                                                            event.name
                                                        )}`}
                                                    </Typography>
                                                ) : (
                                                    <Alert severity="warning">
                                                        <AlertTitle>
                                                            Device not found
                                                        </AlertTitle>
                                                    </Alert>
                                                )}

                                                <Typography variant="h5">
                                                    {renderKeyboardKey(
                                                        selector,
                                                        modifiers,
                                                        true
                                                    )}
                                                </Typography>
                                            </CardContent>
                                            <CardActions>
                                                <IconButtonWithTooltip
                                                    title={"Remove binding"}
                                                    onClick={handleRemoveBinding(
                                                        index
                                                    )}
                                                >
                                                    <DeleteIcon />
                                                </IconButtonWithTooltip>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                )
                            )}
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleOpenAdd}
                                    >
                                        Add binding
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Button
                                        ref={exportRef}
                                        variant="outlined"
                                        href={exportUri}
                                    >
                                        Export
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Suspense>
                                        <ImportButton
                                            icon={false}
                                            text="Import"
                                            onFilesUploaded={
                                                handleFilesUploaded
                                            }
                                            acceptedFiles={["application/json"]}
                                        />
                                    </Suspense>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                )}
            </Grid>
            <Dialog
                open={open}
                onClose={handleCloseAdd}
                maxWidth={"lg"}
                fullWidth={true}
            >
                <DialogTitleWithClose onClose={handleCloseAdd}>
                    Add binding
                </DialogTitleWithClose>
                <DialogContent>
                    <SelectHIDEvent onAdd={handleAdd} />
                </DialogContent>
            </Dialog>
        </>
    )
}
