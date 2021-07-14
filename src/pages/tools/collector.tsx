import React, { useState, useContext, useEffect } from "react"
// tslint:disable-next-line: no-submodule-imports
import { makeStyles, Theme } from "@material-ui/core/styles"
import {
    Grid,
    Button,
    TextField,
    InputAdornment,
    createStyles,
    Switch,
    Card,
    CardActions,
} from "@material-ui/core"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@material-ui/icons/Stop"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import SaveIcon from "@material-ui/icons/Save"
import useChange from "../../jacdac/useChange"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import FieldDataSet from "../../components/FieldDataSet"
import Trend from "../../components/Trend"
// tslint:disable-next-line: no-submodule-imports
import Alert from "../../components/ui/Alert"
import SelectEvent from "../../components/select/SelectEvent"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import {
    EVENT,
    REPORT_UPDATE,
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
import DeviceCardHeader from "../../components/DeviceCardHeader"
import { SensorAggregatorClient } from "../../../jacdac-ts/src/jdom/sensoraggregatorclient"
import { Link } from "gatsby-theme-material-ui"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import ServiceManagerContext from "../../components/ServiceManagerContext"
import useChartPalette from "../../components/useChartPalette"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"
import useEvents from "../../components/hooks/useEvents"
import useDevices from "../../components/hooks/useDevices"
import { useId } from "react-use-id-hook"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import IconButtonWithTooltip from "../../components/ui/IconButtonWithTooltip"
import AppContext from "../../components/AppContext"
import AddIcon from "@material-ui/icons/Add"
import { useSnackbar } from "notistack"

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
        grow: {
            flexGrow: 1,
        },
        field: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
        },
        segment: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        row: {
            marginBottom: theme.spacing(0.5),
        },
        buttons: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        trend: {
            width: theme.spacing(10),
        },
        vmiddle: {
            verticalAlign: "middle",
        },
    })
)

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

export default function Collector() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { enqueueSnackbar } = useSnackbar()
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const classes = useStyles()
    const { fileStorage } = useContext(ServiceManagerContext)
    const [registerIdsChecked, setRegisterIdsChecked] = useState<string[]>([])
    const [aggregatorId, setAggregatorId] = useState<string>("")
    const [recording, setRecording] = useState(false)
    const [tables, setTables] = useState<FieldDataSet[]>([])
    const [, setRecordingLength] = useState(0)
    const [prefix, setPrefix] = useState("data")
    const [samplingIntervalDelay, setSamplingIntervalDelay] = useState("100")
    const [samplingDuration, setSamplingDuration] = useState("10")
    const [liveDataSet, setLiveDataSet] = useState<FieldDataSet>(undefined)
    const [, setLiveDataTimestamp] = useState(0)
    const [triggerEventId, setTriggerEventId] = useState<string>("")
    const chartPalette = useChartPalette()
    const devices = useDevices({ ignoreSelf: true, announced: true })
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
    const aggregators: JDService[] = useChange(bus, bus =>
        bus.services({ serviceClass: SRV_SENSOR_AGGREGATOR })
    )
    const aggregator: JDService = aggregators.find(
        srv => srv.id == aggregatorId
    )
    const samplingIntervalDelayi = parseInt(samplingIntervalDelay)
    const samplingCount = Math.ceil(
        (parseFloat(samplingDuration) * 1000) / samplingIntervalDelayi
    )
    const errorSamplingIntervalDelay =
        isNaN(samplingIntervalDelayi) || !/\d+/.test(samplingIntervalDelay)
    const errorSamplingDuration = isNaN(samplingCount)
    const error = errorSamplingDuration || errorSamplingIntervalDelay
    const triggerEvent = bus.node(triggerEventId) as JDEvent
    const startEnabled = !!recordingRegisters?.length
    const events = useEvents({ ignoreChange: true })
    const aggregatorsId = useId()
    const sensorsId = useId()
    const recordId = useId()
    const recordingsId = useId()
    const dashboardId = useId()

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
        samplingInterval: samplingIntervalDelayi,
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
            setTables([liveDataSet, ...tables])
            setLiveDataSet(newDataSet(registerIdsChecked, true))
            setRecording(false)

            enqueueSnackbar(`recording stopped`)
        }
    }
    const startRecording = async () => {
        if (!recording && recordingRegisters.length) {
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
    const startStreamingRegisters = () => {
        console.log(`start streaming`)
        const streamers = recordingRegisters?.map(reg =>
            reg.subscribe(REPORT_UPDATE, () => {})
        )
        return () => {
            console.log(`stop streaming`)
            streamers.map(streamer => streamer())
        }
    }
    const toggleRecording = () => {
        if (recording) stopRecording()
        else startRecording()
    }
    const handleSamplingIntervalChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSamplingIntervalDelay(event.target.value.trim())
    }
    const handleSamplingDurationChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setSamplingDuration(event.target.value.trim())
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
    // setting interval
    useEffect(() => {
        if (error) return
        console.log(`set interval to ${samplingIntervalDelayi}`)
        recordingRegisters.forEach(reg =>
            reg.sendSetIntAsync(samplingIntervalDelayi)
        )
    }, [samplingIntervalDelayi, registerIdsChecked, errorSamplingIntervalDelay])
    // collecting
    useEffect(() => {
        if (error || (aggregator && recording)) return undefined
        const interval = setInterval(() => addRow(), samplingIntervalDelayi)
        const stopStreaming = startStreamingRegisters()
        return () => {
            clearInterval(interval)
            stopStreaming()
        }
    }, [
        recording,
        samplingIntervalDelayi,
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
        <div className={classes.root}>
            <h1>Data Collector</h1>
            <p>
                Use this page to collect streaming data from Jacdac devices into
                various output formats.
            </p>
            {!!aggregators.length && (
                <section id={aggregatorsId}>
                    <h3>(Optional) Choose a data aggregator</h3>
                    <p>
                        A <Link to="/services/aggregator">data aggregator</Link>{" "}
                        service collects collects sensor data on the bus and
                        returns an aggregated at regular intervals.
                    </p>
                    <Grid container>
                        {aggregators.map(aggregator => (
                            <Grid key={"aggregate" + aggregator.id} item xs={4}>
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
                    </Grid>
                </section>
            )}
            <section id={sensorsId}>
                <h3>
                    Choose sensors &nbsp;
                    <IconButtonWithTooltip
                        title="start simulator"
                        onClick={toggleShowDeviceHostsDialog}
                    >
                        <AddIcon />
                    </IconButtonWithTooltip>
                </h3>
                {!readingRegisters.length && (
                    <Alert className={classes.grow} severity="info">
                        Waiting for sensor...
                    </Alert>
                )}
                {!!readingRegisters.length && (
                    <ReadingFieldGrid
                        readingRegisters={readingRegisters}
                        registerIdsChecked={registerIdsChecked}
                        recording={recording}
                        liveDataSet={liveDataSet}
                        handleRegisterCheck={handleRegisterCheck}
                    />
                )}
            </section>
            <section id={recordId}>
                <h3>Record data</h3>
                {aggregator && (
                    <p>
                        Record the sensor input configuration in order to up
                        your ML model later on.
                    </p>
                )}
                <div className={classes.buttons}>
                    <Button
                        size="large"
                        variant="contained"
                        color={recording ? "secondary" : "primary"}
                        title={recording ? "stop recording" : "start recording"}
                        onClick={toggleRecording}
                        startIcon={recording ? <StopIcon /> : <PlayArrowIcon />}
                        disabled={!startEnabled}
                    >
                        {recording ? "Stop" : "Start"}
                    </Button>
                    {aggregator && (
                        <Button
                            variant="contained"
                            title="save sensor input configuration"
                            onClick={saveConfig}
                            startIcon={<SaveIcon />}
                            disabled={recording}
                        >
                            Save configuration
                        </Button>
                    )}
                </div>
                <div className={classes.row}>
                    <TextField
                        className={classes.field}
                        error={errorSamplingIntervalDelay}
                        disabled={recording}
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
                    <TextField
                        className={classes.field}
                        error={errorSamplingDuration}
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
                    <TextField
                        className={classes.field}
                        disabled={recording}
                        label="File name prefix"
                        value={prefix}
                        variant="outlined"
                        onChange={handlePrefixChange}
                    />
                    <SelectEvent
                        events={events}
                        eventId={triggerEventId}
                        onChange={handleTriggerChange}
                        label={"Start Event"}
                        friendlyName={true}
                    />
                </div>
            </section>
            {!!recordingDevices?.length && (
                <section id={dashboardId}>
                    <Grid container spacing={1}>
                        {recordingDevices?.map(device => (
                            <DashboardDeviceItem
                                key={device.id}
                                device={device}
                                showAvatar={true}
                                showHeader={true}
                            />
                        ))}
                    </Grid>
                </section>
            )}
            {liveDataSet && (
                <Trend
                    key="trends"
                    height={12}
                    dataSet={liveDataSet}
                    horizon={LIVE_HORIZON}
                    dot={true}
                    gradient={true}
                />
            )}
            {!!tables.length && (
                <section id={recordingsId}>
                    <h3>Recordings</h3>
                    <DataSetGrid
                        tables={tables}
                        handleDeleteTable={handleDeleteTable}
                    />
                </section>
            )}
        </div>
    )

    //{liveDataSet && <DataSetTable key="datasettable" className={classes.segment} dataSet={liveDataSet} maxRows={3} minRows={3} />}
}
