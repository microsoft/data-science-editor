import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
} from "@mui/material"
import Trend from "../Trend"
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import React, { useContext, useEffect, useState } from "react"

import { predictRequest } from "../blockly/dsl/workers/tf.proxy"
import type {
    TFModelPredictRequest,
    TFModelPredictResponse,
} from "../../workers/tf/dist/node_modules/tf.worker"

import useChange from "../../jacdac/useChange"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { isSensor } from "../../../jacdac-ts/src/jdom/spec"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import { REPORT_UPDATE } from "../../../jacdac-ts/src/jdom/constants"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"

import ReadingFieldGrid from "../ReadingFieldGrid"
import FieldDataSet from "../FieldDataSet"
import { arraysEqual } from "./MBDataSet"
import MBModel from "./MBModel"

const LIVE_HORIZON = 100

function createDataSet(
    bus: JDBus,
    registers: JDRegister[],
    name: string,
    palette: string[]
) {
    const fields = arrayConcatMany(registers.map(reg => reg.fields))
    const colors = fields.map((f, i) => palette[i % palette.length])
    const set = new FieldDataSet(bus, name, fields, colors)
    set.maxRows = LIVE_HORIZON + 4

    return set
}

export default function ModelOutput(props: {
    chartProps: any
    reactStyle: any
    chartPalette: string[]
    model: MBModel
}) {
    const classes = props.reactStyle
    const { chartPalette, model } = props

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

    useEffect(() => {
        prepareTestingLogs()
    }, [])

    /* For loading page */
    const prepareTestingLogs = () => {
        // Create space to hold prediction data
        const livePredictionDataSet = {
            name: "live-predictions",
            rows: [],
            headers: model.labels,
            units: model.labels.map(() => {
                return "/"
            }),
            colors: model.labels.map(
                (label, idx) => chartPalette[idx % chartPalette.length]
            ),
        }
        setLivePredictions({
            predictionData: FieldDataSet.createFromFile(livePredictionDataSet),
            topClass: model.labels[0],
        })
    }

    /* For predicting with model */
    const [liveRecording, setLiveRecording] = useState<FieldDataSet>(undefined)
    const [, setLiveDataTimestamp] = useState(0)

    const [registerIdsChecked, setRegisterIdsChecked] = useState<string[]>([])
    const [livePredictions, setLivePredictions] = useState({
        predictionData: undefined,
        topClass: "",
    })

    const recordingRegisters = readingRegisters.filter(
        reg => registerIdsChecked.indexOf(reg.id) > -1
    )
    const liveRecordingMatchesModel = () => {
        if (liveRecording) {
            let matchingInputs = true
            if (model.inputTypes) {
                if (!arraysEqual(model.inputTypes, liveRecording.headers)) {
                    matchingInputs = false
                }
            }
            return matchingInputs
        }
        return false
    }
    const sensorsMatch =
        !!recordingRegisters?.length && liveRecordingMatchesModel()

    const handleRegisterCheck = (reg: JDRegister) => {
        const i = registerIdsChecked.indexOf(reg.id)
        if (i > -1) registerIdsChecked.splice(i, 1)
        else registerIdsChecked.push(reg.id)

        registerIdsChecked.sort()
        setRegisterIdsChecked([...registerIdsChecked])
        setLiveRecording(newRecording(registerIdsChecked))
    }

    const newRecording = (registerIds: string[]) =>
        registerIds.length
            ? createDataSet(
                  bus,
                  readingRegisters.filter(
                      reg => registerIds.indexOf(reg.id) > -1
                  ),
                  `liveData`,
                  chartPalette
              )
            : undefined

    const updateLiveData = () => {
        setLiveRecording(liveRecording)
        setLiveDataTimestamp(bus.timestamp)
        updatePrediction()
    }
    const throttleUpdate = throttle(() => updateLiveData(), 30)
    // interval add data entry
    const addRow = (values?: number[]) => {
        if (liveRecording) {
            liveRecording.addRow(values)
            throttleUpdate()
        }
    }
    const startStreamingRegisters = () => {
        const streamers = recordingRegisters?.map(reg =>
            reg.subscribe(REPORT_UPDATE, () => {})
        )
        return () => {
            console.log(`stop streaming`)
            streamers.map(streamer => streamer())
        }
    }
    const updatePrediction = async () => {
        // Use the model to do inference on a data point the model hasn't seen before:
        if (!sensorsMatch) return

        let data = liveRecording.data()
        data = data.slice(data.length - model.inputShape[0])
        const liveInput = [data]

        let topLabel = model.labels[0]

        if (data && data.length >= model.inputShape[0]) {
            const liveOutput = []
            // Get probability values from model
            const predictMsg = {
                worker: "tf",
                type: "predict",
                data: {
                    zData: liveInput,
                    model: model.toJSON(),
                },
            } as TFModelPredictRequest
            const predResult = (await predictRequest(
                predictMsg
            )) as TFModelPredictResponse

            if (predResult) {
                // Save probability for each class in model object
                const prediction = predResult.data.predictAll[0]
                model.labels.forEach(label => {
                    liveOutput.push(prediction[label])

                    // update which class has highest confidence
                    if (liveOutput[label] > liveOutput[topLabel])
                        topLabel = label
                })
                livePredictions.predictionData.addData(liveOutput)
                livePredictions.topClass = topLabel
            }
        }
    }

    useEffect(() => {
        const interval = setInterval(() => addRow(), model.inputInterval)
        const stopStreaming = startStreamingRegisters()

        return () => {
            clearInterval(interval)
            stopStreaming()
        }
    }, [registerIdsChecked])

    const [expanded, setExpanded] = React.useState<string | false>(false)
    const handleExpandedSensorsChange =
        (panel: string) =>
        (event: React.ChangeEvent<unknown>, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false)
        }

    return (
        <Grid container direction={"column"}>
            <Grid item>
                <h3>Live Testing</h3>
                <div key="predict">
                    <span>
                        {" "}
                        Top Class:{" "}
                        {model.status == "trained"
                            ? livePredictions.topClass
                            : "--"}{" "}
                    </span>
                    <br />
                </div>
                <div key="liveData">
                    {liveRecording && (
                        <div>
                            {model.labels.map(label => {
                                return (
                                    <span key={"prediction-key-" + label}>
                                        <FiberManualRecordIcon
                                            className={classes.vmiddle}
                                            fontSize="small"
                                            style={{
                                                color: livePredictions.predictionData.colorOf(
                                                    undefined,
                                                    label
                                                ),
                                            }}
                                        />
                                        {label}
                                    </span>
                                )
                            })}
                            <Trend
                                key="live-data-predictions"
                                height={12}
                                dataSet={livePredictions.predictionData}
                                horizon={LIVE_HORIZON}
                                dot={true}
                                gradient={true}
                            />
                            <Trend
                                key="live-data-trends"
                                height={12}
                                dataSet={liveRecording}
                                horizon={LIVE_HORIZON}
                                dot={true}
                                gradient={true}
                            />
                        </div>
                    )}
                </div>
                <Accordion
                    expanded={expanded === "chooseSensors"}
                    onChange={handleExpandedSensorsChange("chooseSensors")}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div>
                            <h4>Select input sensors</h4>
                            {!sensorsMatch && (
                                <p>
                                    Sensors should match:{" "}
                                    {model.inputTypes.join(", ")}{" "}
                                </p>
                            )}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div key="sensors">
                            {!readingRegisters.length && (
                                <span>Waiting for sensors...</span>
                            )}
                            {!!readingRegisters.length && (
                                <ReadingFieldGrid
                                    readingRegisters={readingRegisters}
                                    registerIdsChecked={registerIdsChecked}
                                    recording={false}
                                    liveDataSet={liveRecording}
                                    handleRegisterCheck={handleRegisterCheck}
                                />
                            )}
                        </div>
                    </AccordionDetails>
                </Accordion>
            </Grid>
        </Grid>
    )
}
