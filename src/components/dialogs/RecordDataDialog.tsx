import React, { useEffect, useContext, useState } from "react"

import {
    Button,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    TextField,
    createStyles,
    InputAdornment,
} from "@material-ui/core"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@material-ui/icons/Stop"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DownloadIcon from "@material-ui/icons/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NavigateNextIcon from "@material-ui/icons/NavigateNext"
import { Autocomplete } from "@material-ui/lab"
import { makeStyles, Theme } from "@material-ui/core/styles"

import ReadingFieldGrid from "../ReadingFieldGrid"
import FieldDataSet from "../FieldDataSet"
import ClassDataSetGrid from "../ClassDataSetGrid"
import Trend from "../Trend"

import useChange from "../../jacdac/useChange"
import useChartPalette from "../useChartPalette"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import ServiceManagerContext from "../ServiceManagerContext"

import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import JDRegister from "../../../jacdac-ts/src/jdom/register"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"
import JDBus from "../../../jacdac-ts/src/jdom/bus"
import { REPORT_UPDATE } from "../../../jacdac-ts/src/jdom/constants"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"
import { BlockSvg, FieldVariable, WorkspaceSvg } from "blockly"
import { MB_CLASS_VAR_TYPE, MODEL_BLOCKS } from "../model-editor/modelblockdsl"
import RecordingBlockField from "../blockly/fields/mb/RecordingBlockField"

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

export default function BlocklyDataRecordingDialog(props: {
    open: boolean
    onDone: (recording:FieldDataSet[], blockId: string) => void
    onClose: () => void
    recordingCount: number
    workspace: WorkspaceSvg
}) {
    const { open, onDone, onClose, recordingCount, workspace } = props
    const [dialogType, setDialogType] = useState<
        "chooseSensors" | "recordData"
    >("chooseSensors")

    
    const classes = useStyles()
    const chartPalette = useChartPalette()
    const { fileStorage } = useContext(ServiceManagerContext)

    const { bus } = useContext<JacdacContextProps>(JacdacContext)
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

    const getWorkspaceClasses = (): string[] => {
        // get updated list of class variables
        const classes = workspace
            .getVariablesOfType(MB_CLASS_VAR_TYPE)
            .map(function (classVar) {
                return classVar.name
            })
        if (classes.length == 0) return ["class1"]
        return classes
    }


    /* For choosing sensors */
    const [registerIdsChecked, setRegisterIdsChecked] = useState<string[]>([])
    const [totalSamples, setTotalSamples] = useState(0)
    const [recordingName, setRecordingName] = useState(
        "recording" + recordingCount
    )
    const [className, setClassName] = useState("class1")

    const [, setRecordingLength] = useState(0)

    const handleRegisterCheck = (reg: JDRegister) => {
        const i = registerIdsChecked.indexOf(reg.id)
        if (i > -1) registerIdsChecked.splice(i, 1)
        else registerIdsChecked.push(reg.id)

        registerIdsChecked.sort()
        setRegisterIdsChecked([...registerIdsChecked])
    }

    const handleRecordingNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRecordingName(event.target.value.trim())
    }

    const handleClassNameChange = (newClassName: string) => {
        setClassName(newClassName)
    }

    /* For recording data*/
    const recordingRegisters = readingRegisters.filter(
        reg => registerIdsChecked.indexOf(reg.id) > -1
    )
    const [isRecording, setIsRecording] = useState(false)
    const [liveRecording, setLiveRecording] = useState<FieldDataSet>(undefined)
    const [, setLiveDataTimestamp] = useState(0)
    const [currentRecording, ] = useState({
        recording: [],
        blockId: ""})

    const [samplingIntervalDelay, setSamplingIntervalDelay] = useState("100")
    const [samplingDuration, setSamplingDuration] = useState("2")

    const samplingIntervalDelayi = parseInt(samplingIntervalDelay)
    const samplingCount = Math.ceil(
        (parseFloat(samplingDuration) * 1000) / samplingIntervalDelayi
    )
    const errorSamplingIntervalDelay =
        isNaN(samplingIntervalDelayi) || !/\d+/.test(samplingIntervalDelay)
    const errorSamplingDuration = isNaN(samplingCount)
    const error = errorSamplingDuration || errorSamplingIntervalDelay
    const startEnabled = !!recordingRegisters?.length

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
    const newRecording = (registerIds: string[], live: boolean) =>
        registerIds.length
            ? createDataSet(
                  bus,
                  readingRegisters.filter(
                      reg => registerIds.indexOf(reg.id) > -1
                  ),
                  `${recordingName}.${totalSamples}`,
                  live,
                  chartPalette
              )
            : undefined

    const stopRecording = () => {
        if (isRecording) {
            // add new samples to recording
            currentRecording.recording.push(liveRecording)
            setTotalSamples(totalSamples + 1)

            // refresh live recording
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
    const handleDeleteSample = (sample: FieldDataSet) => {
        const i = currentRecording.recording.indexOf(sample)
        if (i > -1) currentRecording.recording.splice(i, 1)
    }
    const updateLiveData = () => {
        setLiveRecording(liveRecording)
        setRecordingLength(liveRecording.rows.length)
        setLiveDataTimestamp(bus.timestamp)
    }
    const throttleUpdate = throttle(() => updateLiveData(), 30)
    // data collection
    // interval add data entry
    const addRow = (values?: number[]) => {
        if (!liveRecording) return
        //console.log(values)
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
            reg.sendSetPackedAsync("i32", [samplingIntervalDelayi])
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
    }, [isRecording, dialogType, samplingIntervalDelayi, samplingCount])

    /* For placing a block on the workspace */
    const addNewRecording = () => {
        // Create new block for this recording
        if (className != null && className != undefined) {
            // Get or create new class typed variable
            // (createVariable will return an existing variable if one with a particular name already exists)
            const classVar = workspace.createVariable(
                className,
                MB_CLASS_VAR_TYPE
            )

            // Create new recording block on the workspace
            const newRecordingBlock = workspace.newBlock(
                MODEL_BLOCKS + "recording"
            ) as BlockSvg
            currentRecording.blockId = newRecordingBlock.id

            // Automatically insert the recording name into the new block
            const recordingNameField = newRecordingBlock.getField(
                "RECORDING_NAME"
            ) as FieldVariable
            recordingNameField.setValue(recordingName)

            // Automatically insert the class name into the new block
            const classNameField = newRecordingBlock.getField(
                "CLASS_NAME"
            ) as FieldVariable
            classNameField.setValue(classVar.getId())

            // Save recording data to block
            const blockParamsField = newRecordingBlock.getField(
                "BLOCK_PARAMS"
            ) as RecordingBlockField
            const recordingBlockParams = {
                parametersVisible: null,
                numSamples: currentRecording.recording.length,
                timestamp: currentRecording.recording[0].startTimestamp,
                inputTypes: currentRecording.recording[0].headers,
            }
            blockParamsField.updateFieldValue(recordingBlockParams)

            newRecordingBlock.initSvg()
            newRecordingBlock.render(false)
            workspace.centerOnBlock(newRecordingBlock.id)
        }
    }

    /* For interface controls */
    const resetInputs = () => {
        setClassName("class1")
        setRecordingName("recording" + recordingCount)
        setSamplingIntervalDelay("100")
        setSamplingDuration("2")
    }
    const handleDownloadDataSet = () => {
        const recordingCountHeader = `Number of recordings,${currentRecording.recording.length}`

        const recordingData: string[] = []
        currentRecording.recording.forEach(sample => {
            recordingData.push(
                "Recording metadata," +
                    sample.name +
                    "," +
                    sample.rows.length +
                    "," +
                    className
            )
            recordingData.push(sample.toCSV())
        })
        const recordData = recordingData.join("\n")

        const csv: string[] = [recordingCountHeader, recordData]
        fileStorage.saveText(`${recordingName}dataset.csv`, csv.join("\n"))
    }
    const handleCancel = () => {
        // reset the user inputs
        resetInputs()
        // close the modal
        onClose()
    }
    const handleNext = () => {
        // begin recording live data
        setLiveRecording(newRecording(registerIdsChecked, true))

        // go to the next page
        setDialogType("recordData")
    }

    const handleDone = () => {
        // create new recording block
        addNewRecording()

        // reset the user inputs
        resetInputs()

        // call the done function
        const { recording, blockId } = currentRecording
        onDone(recording, blockId)

        onClose()
    }

    return (
        <Dialog open={open} onClose={onClose}>
            {dialogType == "chooseSensors" ? (
                <>
                    <DialogContent>
                        <Grid container direction={"column"}>
                            <Grid item>
                                <h2>Collect new recording</h2>
                                {/* RANDI TODO Toggle button to get data from sensors vs upload from file */}
                                <div key="sensors">
                                    <div className={classes.row}>
                                        <TextField
                                            className={classes.field}
                                            label="Recording name"
                                            value={recordingName}
                                            variant="outlined"
                                            onChange={handleRecordingNameChange}
                                        />
                                        <Autocomplete
                                            className={classes.field}
                                            disabled={isRecording}
                                            options={getWorkspaceClasses()}
                                            style={{
                                                width: 250,
                                                display: "inline-flex",
                                            }}
                                            renderInput={params => (
                                                <TextField
                                                    {...params}
                                                    label="Class label"
                                                    variant="outlined"
                                                />
                                            )}
                                            value={className}
                                            onInputChange={(event, newValue) =>
                                                handleClassNameChange(newValue)
                                            }
                                        />
                                    </div>
                                    <h3>Collect data from</h3>
                                    {!readingRegisters.length && (
                                        <span>Waiting for sensors...</span>
                                    )}
                                    {!!readingRegisters.length && (
                                        <ReadingFieldGrid
                                            readingRegisters={readingRegisters}
                                            registerIdsChecked={
                                                registerIdsChecked
                                            }
                                            recording={isRecording}
                                            liveDataSet={liveRecording}
                                            handleRegisterCheck={
                                                handleRegisterCheck
                                            }
                                        />
                                    )}
                                </div>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<NavigateNextIcon />}
                            disabled={!registerIdsChecked.length}
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    </DialogActions>
                </>
            ) : (
                // recordData
                <>
                    <DialogContent>
                        <Grid container direction={"column"}>
                            <Grid item>
                                <h3>Edit recording: {recordingName}</h3>
                                <div key="recordedData">
                                    <div key="recordings">
                                        <h4>
                                            Recorded samples
                                            <IconButtonWithTooltip
                                                onClick={handleDownloadDataSet}
                                                title="Download all recording data"
                                                disabled={
                                                    currentRecording.recording.length == 0
                                                }
                                            >
                                                <DownloadIcon />
                                            </IconButtonWithTooltip>
                                        </h4>
                                        {currentRecording.recording.length ? (
                                            <ClassDataSetGrid
                                                key={"samples-" + recordingName}
                                                label={className}
                                                tables={currentRecording.recording}
                                                handleDeleteTable={
                                                    handleDeleteSample
                                                }
                                            />
                                        ) : (
                                            <span>None</span>
                                        )}
                                    </div>
                                </div>
                            </Grid>
                            <Grid item>
                                <br />
                            </Grid>
                            <Grid item>
                                <div key="record">
                                    <div className={classes.row}>
                                        <h4>Add more samples</h4>
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
                                            onChange={
                                                handleSamplingDurationChange
                                            }
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
                                            onChange={
                                                handleSamplingIntervalChange
                                            }
                                        />
                                    </div>
                                    <div className={classes.buttons}>
                                        <Button
                                            size="large"
                                            variant="contained"
                                            color={
                                                isRecording
                                                    ? "secondary"
                                                    : "primary"
                                            }
                                            aria-label="start/stop recording"
                                            title="start/stop recording"
                                            onClick={toggleRecording}
                                            startIcon={
                                                isRecording ? (
                                                    <StopIcon />
                                                ) : (
                                                    <PlayArrowIcon />
                                                )
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
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<NavigateNextIcon />}
                            disabled={!currentRecording.recording.length}
                            onClick={handleDone}
                        >
                            Done
                        </Button>
                    </DialogActions>
                </>
            )}
        </Dialog>
    )
}
