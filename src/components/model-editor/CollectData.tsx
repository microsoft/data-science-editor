import React, { lazy, useEffect, useContext, useState } from "react"

import { Button, Grid, TextField, InputAdornment } from "@mui/material"
import { Autocomplete } from "@mui/material"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@mui/icons-material/Stop"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DownloadIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteAllIcon from "@mui/icons-material/DeleteSweep"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NavigateNextIcon from "@mui/icons-material/NavigateNext"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AddIcon from "@mui/icons-material/Add"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

import ServiceManagerContext from "../ServiceManagerContext"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

import useChange from "../../jacdac/useChange"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import { REPORT_UPDATE } from "../../../jacdac-ts/src/jdom/constants"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"

import Trend from "../Trend"
import ClassDataSetGrid from "../ClassDataSetGrid"
import ReadingFieldGrid from "../ReadingFieldGrid"
import FieldDataSet from "../FieldDataSet"
import MBDataSet, { arraysEqual } from "./MBDataSet"
import { DATASET_NAME } from "./ModelEditor"
import Suspense from "../ui/Suspense"
import AppContext from "../AppContext"

const DataSetPlot = lazy(() => import("./components/DataSetPlot"))

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

export default function CollectData(props: {
    chartProps: any
    reactStyle: any
    chartPalette: string[]
    dataset: MBDataSet
    onChange: (dataset) => void
    onNext: (dataset) => void
}) {
    const { chartPalette, onChange, onNext } = props
    const [dataset, setDataSet] = useState<MBDataSet>(props.dataset)
    const [dataTimestamp, setDataTimestamp] = useState(0)
    const classes = props.reactStyle
    const chartProps = props.chartProps

    const { fileStorage } = useContext(ServiceManagerContext)
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { toggleShowDeviceHostsDialog } = useContext(AppContext)
    const handleShowStartSimulator = () => toggleShowDeviceHostsDialog()
    const readingRegisters = useChange(bus, bus =>
        arrayConcatMany(
            bus.devices().map(device =>
                device
                    .services()
                    .filter(srv => isSensor(srv.specification))
                    .map(srv => srv.readingRegister)
            )
        )
    )

    /* For choosing sensors */
    const [registerIdsChecked, setRegisterIdsChecked] = useState<string[]>([])
    const [totalRecordings, setTotalRecordings] = useState(0)
    const [recordingName, setRecordingName] = useState(
        "recording" + totalRecordings
    )

    const [isRecording, setIsRecording] = useState(false)
    const [liveRecording, setLiveRecording] = useState<FieldDataSet>(undefined)
    const [, setLiveDataTimestamp] = useState(0)

    const newRecording = (registerIds: string[], live: boolean) =>
        registerIds.length
            ? createDataSet(
                  bus,
                  readingRegisters.filter(
                      reg => registerIds.indexOf(reg.id) > -1
                  ),
                  `${currentClassLabel}$${dataset.totalRecordings}`,
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
        setLiveRecording(newRecording(registerIdsChecked, true))
    }

    const handleRecordingNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRecordingName(event.target.value.trim())
    }

    /* For recording data*/
    const [currentClassLabel, setCurrentClassLabel] = useState("class1")
    const [samplingIntervalDelay, setSamplingIntervalDelay] = useState("50")
    const [samplingDuration, setSamplingDuration] = useState("2")
    const [datasetMatch, setDataSetMatch] = useState(false)
    const recordingRegisters = readingRegisters.filter(
        reg => registerIdsChecked.indexOf(reg.id) > -1
    )

    const samplingIntervalDelayi = parseInt(samplingIntervalDelay)
    const samplingCount = Math.ceil(
        (parseFloat(samplingDuration) * 1000) / samplingIntervalDelayi
    )
    const errorSamplingIntervalDelay =
        isNaN(samplingIntervalDelayi) || !/\d+/.test(samplingIntervalDelay)
    const errorSamplingDuration = isNaN(samplingCount)
    const error = errorSamplingDuration || errorSamplingIntervalDelay
    const startEnabled = !!recordingRegisters?.length && datasetMatch

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
    const handleLabelChange = newLabel => {
        setCurrentClassLabel(newLabel)
    }
    const handleDownloadDataSet = async () => {
        fileStorage.saveText(`${dataset.name}.csv`, dataset.toCSV())
    }
    const handleDeleteDataSet = () => {
        if (confirm("Are you sure you want to delete all recorded samples?")) {
            const newDataSet = new MBDataSet(DATASET_NAME)
            handleDataSetUpdate(newDataSet)
            setDataSet(newDataSet)

            resetDataCollection()
        }
    }
    const resetDataCollection = () => {
        setCurrentClassLabel("class1")
        setTotalRecordings(0)
        setSamplingIntervalDelay("50")
        setSamplingDuration("2")
    }
    const stopRecording = () => {
        if (isRecording) {
            // add new data to the dataset
            liveRecording.interval = samplingIntervalDelayi
            dataset.addRecording(
                liveRecording,
                currentClassLabel,
                registerIdsChecked
            )
            setTotalRecordings(totalRecordings + 1)
            setDataSet(dataset)
            handleDataSetUpdate(dataset)
            setDataTimestamp(Date.now())

            // create new live recording
            setLiveRecording(newRecording(registerIdsChecked, true))

            // stop recording
            setIsRecording(false)
        }
    }
    const startRecording = async () => {
        if (!isRecording && recordingRegisters.length) {
            setLiveRecording(newRecording(registerIdsChecked, false))
            setIsRecording(true)
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
        if (isRecording) stopRecording()
        else startRecording()
    }
    const handleDeleteRecording = (recording: FieldDataSet) => {
        dataset.removeRecording(recording)
        setDataTimestamp(Date.now())
        setDataSet(dataset)
        handleDataSetUpdate(dataset)
    }
    const updateLiveData = () => {
        setLiveRecording(liveRecording)
        setLiveDataTimestamp(bus.timestamp)
    }
    const throttleUpdate = throttle(() => updateLiveData(), 30)
    // data collection
    // interval add data entry
    const addRow = (values?: number[]) => {
        if (!liveRecording) return
        liveRecording.addRow(values)
        if (isRecording && liveRecording.length >= samplingCount) {
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
            reg.sendSetPackedAsync([samplingIntervalDelayi])
        )
    }, [samplingIntervalDelayi, registerIdsChecked, errorSamplingIntervalDelay])
    // collecting
    useEffect(() => {
        if (error) return undefined
        const interval = setInterval(() => addRow(), samplingIntervalDelayi)
        const stopStreaming = startStreamingRegisters()

        return () => {
            clearInterval(interval)
            stopStreaming()
        }
    }, [isRecording, samplingIntervalDelayi, samplingCount, registerIdsChecked])
    useEffect(() => {
        setRecordingName("recording" + totalRecordings)
    }, [totalRecordings])
    useEffect(() => {
        let matchingInputs = true
        if (dataset && liveRecording) {
            if (dataset.inputTypes && dataset.inputTypes.length) {
                if (!arraysEqual(dataset.inputTypes, liveRecording.headers))
                    matchingInputs = false
            }
        }
        setDataSetMatch(matchingInputs)
    }, [registerIdsChecked, liveRecording])

    const handleDataSetUpdate = dataset => {
        onChange(dataset)
    }
    const handleNext = () => {
        onNext(dataset)
    }

    return (
        <Grid container direction={"column"}>
            <Grid item>
                <h2>
                    Current Dataset
                    <IconButtonWithTooltip
                        onClick={handleDownloadDataSet}
                        title="Download all recording data"
                        disabled={dataset.totalRecordings == 0}
                    >
                        <DownloadIcon />
                    </IconButtonWithTooltip>
                    <IconButtonWithTooltip
                        onClick={handleDeleteDataSet}
                        title="Delete all recording data"
                        disabled={dataset.totalRecordings == 0}
                    >
                        <DeleteAllIcon />
                    </IconButtonWithTooltip>
                </h2>
                <div key="recordedData">
                    {dataset.totalRecordings ? (
                        <div key="recordings">
                            <p>
                                Input type(s): {dataset.inputTypes.join(",")}{" "}
                            </p>
                            {dataset.labels.map(classLabel => (
                                <ClassDataSetGrid
                                    key={"dataset-" + classLabel}
                                    label={classLabel}
                                    tables={dataset.getRecordingsWithLabel(
                                        classLabel
                                    )}
                                    handleDeleteTable={handleDeleteRecording}
                                />
                            ))}
                            <br />
                            <Suspense>
                                <DataSetPlot
                                    chartProps={chartProps}
                                    reactStyle={classes}
                                    dataset={dataset}
                                    predictedLabels={undefined}
                                    timestamp={dataTimestamp}
                                />
                            </Suspense>
                        </div>
                    ) : (
                        <p>Empty</p>
                    )}
                </div>
            </Grid>
            <Grid item>
                <h2>Collect More Data</h2>
                {/* TODO Toggle button to get data from sensors vs upload from file */}
                <div key="sensors">
                    <h3>
                        Select input sensors&nbsp;
                        <IconButtonWithTooltip
                            title="start simulator"
                            onClick={handleShowStartSimulator}
                        >
                            <AddIcon />
                        </IconButtonWithTooltip>
                    </h3>
                    {!readingRegisters.length && (
                        <span>Waiting for sensors...</span>
                    )}
                    {!!readingRegisters.length && (
                        <ReadingFieldGrid
                            readingRegisters={readingRegisters}
                            registerIdsChecked={registerIdsChecked}
                            recording={isRecording}
                            liveDataSet={liveRecording}
                            handleRegisterCheck={handleRegisterCheck}
                        />
                    )}
                </div>
            </Grid>
            <Grid item>
                <div key="record">
                    <h3>Record data</h3>
                    <div className={classes.row}>
                        <TextField
                            className={classes.field}
                            label="Recording name"
                            value={recordingName}
                            variant="outlined"
                            onChange={handleRecordingNameChange}
                        />
                        <Autocomplete
                            disabled={isRecording}
                            className={classes.field}
                            options={dataset.labelOptions}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    label="Class label"
                                    variant="outlined"
                                />
                            )}
                            value={currentClassLabel}
                            onInputChange={(event, newValue) =>
                                handleLabelChange(newValue)
                            }
                            isOptionEqualToValue={() => true}
                        />
                        <TextField
                            className={classes.field}
                            error={errorSamplingDuration}
                            disabled={isRecording}
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
                            error={errorSamplingIntervalDelay}
                            disabled={isRecording}
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
                    </div>
                    <div className={classes.buttons}>
                        <Button
                            size="large"
                            variant="contained"
                            color={isRecording ? "secondary" : "primary"}
                            aria-label="start/stop recording"
                            title="start/stop recording"
                            onClick={toggleRecording}
                            startIcon={
                                isRecording ? <StopIcon /> : <PlayArrowIcon />
                            }
                            disabled={!startEnabled}
                        >
                            {isRecording ? "Stop" : "Start"}
                        </Button>
                    </div>
                </div>
                <div key="liveData">
                    {liveRecording && (
                        <Trend
                            key="trends"
                            height={12}
                            dataSet={liveRecording}
                            horizon={LIVE_HORIZON}
                            dot={true}
                            gradient={true}
                        />
                    )}
                </div>
            </Grid>
            <Grid item style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className={classes.buttons}>
                    <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<NavigateNextIcon />}
                        disabled={dataset.labels.length < 2}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div>
            </Grid>
        </Grid>
    )
}
