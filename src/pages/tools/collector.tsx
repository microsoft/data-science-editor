import React, { useState, useContext, useEffect } from "react"
import {
    Grid,
    Button,
    TextField,
    InputAdornment,
    Switch,
    Card,
    CardActions,
} from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@mui/icons-material/Stop"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@mui/icons-material/Save"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import FieldDataSet from "../../components/FieldDataSet"
import Trend from "../../components/Trend"
// tslint:disable-next-line: no-submodule-imports
import Alert from "../../components/ui/Alert"
import SelectEvent from "../../components/select/SelectEvent"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import {
    EVENT,
    SRV_SENSOR_AGGREGATOR,
} from "../../../jacdac-ts/src/jdom/constants"
import {
    arrayConcatMany,
    throttle,
    uniqueMap,
} from "../../../jacdac-ts/src/jdom/utils"
import DataSetGrid from "../../components/DataSetGrid"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import ReadingFieldGrid from "../../components/ReadingFieldGrid"
import DeviceCardHeader from "../../components/devices/DeviceCardHeader"
import { SensorAggregatorClient } from "../../../jacdac-ts/src/clients/sensoraggregatorclient"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import ServiceManagerContext from "../../components/ServiceManagerContext"
import useChartPalette from "../../components/useChartPalette"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"
import useEvents from "../../components/hooks/useEvents"
import useDevices from "../../components/hooks/useDevices"
import { useId } from "react"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import AddIcon from "@mui/icons-material/Add"
import useServices from "../../components/hooks/useServices"
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import FileTabs from "../../components/fs/FileTabs"
import useFileSystem from "../../components/FileSystemContext"
import useChange from "../../jacdac/useChange"
import GridHeader from "../../components/ui/GridHeader"
import useSnackbar from "../../components/hooks/useSnackbar"
import SimulatorDialogsContext from "../../components/SimulatorsDialogContext"
import useBus from "../../jacdac/useBus"

export const frontmatter = {
    title: "Data Collector",
    description: "Record data from one or many services into files.",
}
import CoreHead from "../../components/shell/Head"
export const Head = (props) => <CoreHead {...props} {...frontmatter} />

const LIVE_HORIZON = 24
function createDataSet(
    bus: JDBus,
    registers: JDRegister[],
    name: string,
    live: boolean,
    palette: string[]
) {
    const fields = arrayConcatMany(registers.map(reg => reg.fields))
    const colors = fields.map((f, i) => palette[i % palette.length])
    const set = new FieldDataSet(bus, name, fields, colors)
    if (live) set.maxRows = LIVE_HORIZON + 4

    return set
}

const COLLECTOR_PREFIX = "jacdac:collector:prefix"
const COLLECTOR_SAMPLING_INTERVAL = "jacdac:collector:samplinginterval"
const COLLECTOR_SAMPLING_DURATION = "jacdac:collector:samplingduration"
const COLLECTOR_START_DELAY = "jacdac:collector:startdelay"

export default function Collector() {
    const bus = useBus()
    const { toggleShowDeviceHostsDialog } = useContext(SimulatorDialogsContext)
    const { enqueueSnackbar } = useSnackbar()
    const handleShowStartSimulator = () =>
        toggleShowDeviceHostsDialog({ sensor: true })
    const { fileSystem } = useFileSystem()
    const root = useChange(fileSystem, _ => _?.root)
    const { fileStorage } = useContext(ServiceManagerContext)
    const [registerIdsChecked, setRegisterIdsChecked] = useState<string[]>([])
    const [aggregatorId, setAggregatorId] = useState<string>("")
    const [recording, setRecording] = useState(false)
    const [tables, setTables] = useState<FieldDataSet[]>([])
    const [, setRecordingLength] = useState(0)

    const [prefix, setPrefix] = useLocalStorage(COLLECTOR_PREFIX, "data")
    const [samplingIntervalDelay, setSamplingIntervalDelay] = useLocalStorage(
        COLLECTOR_SAMPLING_INTERVAL,
        100
    )
    const [samplingDuration, setSamplingDuration] = useLocalStorage(
        COLLECTOR_SAMPLING_DURATION,
        10
    )
    const [startDelay, setStartDelay] = useLocalStorage(
        COLLECTOR_START_DELAY,
        0
    )

    const [liveDataSet, setLiveDataSet] = useState<FieldDataSet>(undefined)
    const [, setLiveDataTimestamp] = useState(0)
    const [triggerEventId, setTriggerEventId] = useState<string>("")
    const [countdown, setCountdown] = useState(-1)
    const starting = countdown > 0
    const chartPalette = useChartPalette()
    const devices = useDevices({ ignoreInfrastructure: true, announced: true })
    const readingRegisters = arrayConcatMany(
        devices.map(device =>
            device
                .services()
                .filter(srv => isSensor(srv.specification))
                .map(srv => srv.readingRegister)
        )
    )
    const recordingRegisters = readingRegisters.filter(
        reg => registerIdsChecked.indexOf(reg.id) > -1
    )
    const recordingDevices = uniqueMap(
        recordingRegisters,
        reg => reg.service.device.deviceId,
        reg => reg.service.device
    )
    const aggregators: JDService[] = useServices({
        serviceClass: SRV_SENSOR_AGGREGATOR,
    })
    const aggregator: JDService = aggregators.find(
        srv => srv.id == aggregatorId
    )
    const samplingCount = Math.ceil(
        (samplingDuration * 1000) / samplingIntervalDelay
    )
    const triggerEvent = bus.node(triggerEventId) as JDEvent
    const startEnabled = !starting && !!recordingRegisters?.length
    const events = useEvents({ ignoreChange: true })
    const id = useId()
    const samplingIntervalId = id + "-samplinginterval"
    const samplingDurationId = id + "-samplingduration"
    const startDelayId = id + "-startdelay"
    const prefixId = id + "-prefix"

    useEffect(() => {
        //console.log(`trigger event`, triggerEventId, triggerEvent)
        const un = triggerEvent?.subscribe(EVENT, () => {
            //console.log(`trigger toggle recoring`, recording)
            toggleRecording()
        })
        //console.log(`mounted`, triggerEvent)
        return () => {
            //console.log(`unmount trigger`)
            if (un) un()
        }
    }, [triggerEvent, recording, registerIdsChecked, liveDataSet])

    const createSensorConfig = () => ({
        samplingInterval: samplingIntervalDelay,
        samplesInWindow: 10,
        inputs: recordingRegisters.map(reg => ({
            serviceClass: reg.service.serviceClass,
        })),
    })
    const saveConfig = () => {
        const sensorConfig = JSON.stringify(createSensorConfig(), null, 2)
        fileStorage.saveText(
            `${prefix || "jacdac"}-sensor-config.json`,
            sensorConfig
        )
    }
    const newDataSet = (registerIds: string[], live: boolean) =>
        registerIds.length
            ? createDataSet(
                  bus,
                  readingRegisters.filter(
                      reg => registerIds.indexOf(reg.id) > -1
                  ),
                  `${prefix || "data"}${tables.length}`,
                  live,
                  chartPalette
              )
            : undefined
    const handleRegisterCheck = (reg: JDRegister) => {
        const i = registerIdsChecked.indexOf(reg.id)
        if (i > -1) registerIdsChecked.splice(i, 1)
        else registerIdsChecked.push(reg.id)
        registerIdsChecked.sort()
        setRegisterIdsChecked([...registerIdsChecked])
        setLiveDataSet(newDataSet(registerIdsChecked, true))
    }
    const stopRecording = () => {
        if (recording) {
            if (root) {
                const csv = liveDataSet.toCSV()
                // write async
                const now = new Date()
                const name = `data-${now.getFullYear()}-${
                    now.getMonth() + 1
                }-${now.getDate()}-${now.getHours()}-${now.getMinutes()}-${now.getSeconds()}.csv`
                root.fileAsync(name, { create: true }).then(f => f.write(csv))
            }
            setTables([liveDataSet, ...tables])
            setLiveDataSet(newDataSet(registerIdsChecked, true))
            setRecording(false)

            enqueueSnackbar(`recording stopped`)
        }
    }
    const startRecording = async () => {
        if (!starting && !recording && recordingRegisters.length) {
            // do countdown
            if (startDelay > 0) {
                let countdown = Math.ceil(startDelay)
                while (countdown > 0) {
                    setCountdown(countdown)
                    await delay(1000)
                    countdown--
                }
            }
            setCountdown(-1)
            setLiveDataSet(newDataSet(registerIdsChecked, false))
            setRecording(true)
            if (aggregator) {
                const client = new SensorAggregatorClient(aggregator)
                await client.setInputs(createSensorConfig())
                client.collect(samplingCount)
            }
            enqueueSnackbar(`recording started`)
        }
    }
    const toggleRecording = () => {
        if (recording) stopRecording()
        else startRecording()
    }
    const handleSamplingIntervalChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const v = parseInt(event.target.value)
        if (!isNaN(v)) setSamplingIntervalDelay(v)
    }
    const handleSamplingDurationChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const v = parseInt(event.target.value)
        if (!isNaN(v)) setSamplingDuration(v)
    }
    const handleStartDelayChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const v = parseInt(event.target.value)
        if (!isNaN(v)) setStartDelay(v)
    }
    const handlePrefixChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPrefix(event.target.value.trim())
    }
    const handleTriggerChange = (eventId: string) => setTriggerEventId(eventId)
    const handleDeleteTable = (table: FieldDataSet) => {
        const i = tables.indexOf(table)
        if (i > -1) {
            tables.splice(i, 1)
            setTables([...tables])
        }
    }
    const handleAggregatorChecked = (srv: JDService) => () => {
        const id = srv?.id == aggregatorId ? "" : srv?.id
        setAggregatorId(id)
    }
    const updateLiveData = () => {
        setLiveDataSet(liveDataSet)
        setRecordingLength(liveDataSet.rows.length)
        setLiveDataTimestamp(bus.timestamp)
    }
    const throttleUpdate = throttle(() => updateLiveData(), 30)
    // data collection
    // interval add data entry
    const addRow = (values?: number[]) => {
        if (!liveDataSet) return
        //console.log(values)
        liveDataSet.addRow(values)
        if (recording && liveDataSet.length >= samplingCount) {
            // stop recording
            updateLiveData()
            stopRecording()
        } else {
            throttleUpdate()
        }
    }
    // stream data
    useEffect(() => {
        bus.streaming = true
        return () => {
            bus.streaming = false
        }
    }, [])
    // collecting
    useEffect(() => {
        if (aggregator && recording) return undefined
        const interval = setInterval(() => addRow(), samplingIntervalDelay)
        return () => {
            clearInterval(interval)
        }
    }, [
        recording,
        samplingIntervalDelay,
        samplingCount,
        registerIdsChecked,
        aggregator,
    ])
    useEffect(() => {
        if (aggregator) {
            const client = new SensorAggregatorClient(aggregator)
            return client.subscribeSample(values => addRow(values))
        }
        return () => {}
    }, [recording, liveDataSet, registerIdsChecked, aggregator])

    return (
        <>
            <h1>Data Collector</h1>
            <p>
                Use this page to collect streaming data from Jacdac devices into
                various output formats.
            </p>
            <Grid container spacing={1}>
                {!!aggregators.length && (
                    <>
                        <GridHeader title="(Optional) Choose a data aggregator" />
                        {aggregators.map(aggregator => (
                            <Grid key={aggregator.id} item xs={4}>
                                <Card>
                                    <DeviceCardHeader
                                        device={aggregator.device}
                                        showAvatar={true}
                                    />
                                    <CardActions>
                                        <Switch
                                            checked={
                                                aggregatorId == aggregator.id
                                            }
                                            disabled={recording}
                                            onChange={handleAggregatorChecked(
                                                aggregator
                                            )}
                                        />
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </>
                )}
                <GridHeader
                    title="Sensors"
                    action={
                        <IconButtonWithTooltip
                            title="start simulator"
                            onClick={handleShowStartSimulator}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                    }
                />
                {!readingRegisters.length && (
                    <Grid item xs={12}>
                        <Alert severity="info">Waiting for sensor...</Alert>
                    </Grid>
                )}
                {!!readingRegisters.length && (
                    <Grid item xs={12}>
                        <ReadingFieldGrid
                            readingRegisters={readingRegisters}
                            registerIdsChecked={registerIdsChecked}
                            recording={recording}
                            liveDataSet={liveDataSet}
                            handleRegisterCheck={handleRegisterCheck}
                        />
                    </Grid>
                )}
                <GridHeader title="Recorder" />
                {aggregator && (
                    <Grid item xs={12}>
                        <Alert severity="info">
                            Record the sensor input configuration in order to up
                            your ML model later on.
                        </Alert>
                    </Grid>
                )}
                <Grid item xs={12}>
                    <Button
                        size="large"
                        variant="contained"
                        color={recording ? "secondary" : "primary"}
                        title={
                            starting
                                ? `starting in ${countdown}`
                                : recording
                                ? "stop recording"
                                : "start recording"
                        }
                        onClick={toggleRecording}
                        startIcon={
                            starting ? (
                                <HourglassEmptyIcon />
                            ) : recording ? (
                                <StopIcon />
                            ) : (
                                <PlayArrowIcon />
                            )
                        }
                        disabled={!startEnabled}
                    >
                        {starting
                            ? countdown + ""
                            : recording
                            ? "Stop"
                            : "Start"}
                    </Button>
                </Grid>
                <Grid item xs={12} mt={1}>
                    <Grid container direction="row" spacing={1}>
                        {aggregator && (
                            <Grid item>
                                <Button
                                    variant="contained"
                                    title="save sensor input configuration"
                                    onClick={saveConfig}
                                    startIcon={<SaveIcon />}
                                    disabled={recording}
                                >
                                    Save configuration
                                </Button>
                            </Grid>
                        )}
                        <Grid item>
                            <TextField
                                id={samplingIntervalId}
                                disabled={recording}
                                type="number"
                                label="Sampling interval"
                                value={samplingIntervalDelay}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            ms
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={handleSamplingIntervalChange}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id={samplingDurationId}
                                type="number"
                                disabled={recording}
                                label="Sampling duration"
                                value={samplingDuration}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            s
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={handleSamplingDurationChange}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id={startDelayId}
                                type="number"
                                disabled={recording}
                                label="Start delay"
                                value={startDelay}
                                variant="outlined"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            s
                                        </InputAdornment>
                                    ),
                                }}
                                onChange={handleStartDelayChange}
                            />
                        </Grid>
                        <Grid item>
                            <TextField
                                id={prefixId}
                                disabled={recording}
                                label="File name prefix"
                                value={prefix}
                                variant="outlined"
                                onChange={handlePrefixChange}
                            />
                        </Grid>
                        <Grid item>
                            <SelectEvent
                                events={events}
                                eventId={triggerEventId}
                                onChange={handleTriggerChange}
                                label={"Start Event"}
                                friendlyName={true}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                {recordingDevices?.map(device => (
                    <DashboardDeviceItem
                        key={device.id}
                        device={device}
                        showAvatar={true}
                        showHeader={true}
                    />
                ))}
                {liveDataSet && (
                    <Grid item xs={12}>
                        <Trend
                            key="trends"
                            height={12}
                            dataSet={liveDataSet}
                            horizon={LIVE_HORIZON}
                            dot={true}
                            gradient={true}
                            yAxis={false}
                        />
                    </Grid>
                )}
                <GridHeader title="Recordings" />
                <Grid item xs={12}>
                    <FileTabs hideFiles={true} hideDirectories={true} />
                </Grid>
                {!!tables.length && (
                    <Grid item xs={12}>
                        <DataSetGrid
                            tables={tables}
                            handleDeleteTable={handleDeleteTable}
                        />
                    </Grid>
                )}
            </Grid>
        </>
    )
}
