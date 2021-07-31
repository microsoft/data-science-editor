import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Grid,
} from "@material-ui/core"
import Trend from "../Trend"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import DeleteIcon from "@material-ui/icons/Delete"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import NavigateNextIcon from "@material-ui/icons/NavigateNext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import ExpandMoreIcon from "@material-ui/icons/ExpandMore"
import React, { useEffect, useState } from "react"

import { trainRequest } from "../blockly/dsl/workers/tf.proxy"
import type {
    TFModelTrainRequest,
    TFModelTrainResponse,
} from "../../workers/tf/dist/node_modules/tf.worker"

import FieldDataSet from "../FieldDataSet"
import ModelDataSet from "./ModelDataSet"
import MBModel from "./MBModel"
import workerProxy from "../blockly/dsl/workers/proxy"

const NUM_EPOCHS = 250
const LOSS_COLOR = "#8b0000"
const ACC_COLOR = "#77dd77"

export default function TrainModel(props: {
    reactStyle: any
    dataset: ModelDataSet
    model: MBModel
    onChange: (model) => void
    onNext: (model) => void
}) {
    const classes = props.reactStyle
    const { dataset, onChange, onNext } = props
    const [model, setModel] = useState<MBModel>(props.model)

    const [pageReady, setPageReady] = useState(false)
    useEffect(() => {
        if (!pageReady) {
            prepareDataSet(dataset)
            prepareModel(model)
            prepareTrainingLogs()
            setPageReady(true)
        }
    }, [])

    /* For loading page */
    const prepareDataSet = (set: ModelDataSet) => {
        // Assumptions: the sampling rate, sampling duration, and sensors used are constant
        let sampleLength = -1
        let sampleChannels = -1
        const xData = []
        const yData = []

        for (const label of set.labels) {
            set.getRecordingsWithLabel(label).forEach(table => {
                if (sampleLength < table.length) {
                    sampleLength = table.length
                    sampleChannels = table.width
                } else if (table.width != sampleChannels) {
                    setTrainEnabled(false)
                    alert(
                        "All input data must have the same shape: " +
                            table.name +
                            "\n Has " +
                            table.width +
                            " inputs instead of " +
                            sampleChannels
                    )
                } /* else if (table.length != sampleLength) {
                    // Randi decide what to do about different sized data
                } */
                // For x data, just add each sample as a new row into x_data
                xData.push(table.data())

                yData.push(set.labels.indexOf(label))
            })
        }

        // save tensors with dataset object
        set.xs = xData
        set.ys = yData
        set.length = sampleLength
        set.width = sampleChannels
    }

    const prepareModel = (mod: MBModel) => {
        // Use a standard architecture for models made on this page
        if (mod.modelJSON == "") {
            // this model has no architecture, use default arch
            mod.modelJSON = "default"

            // Update model
            mod.labels = dataset.labels
            mod.inputShape = [dataset.length, dataset.width]
            mod.inputTypes = dataset.inputTypes
            mod.outputShape = dataset.labels.length
        }
    }

    const prepareTrainingLogs = () => {
        // Create space to hold training log data
        const trainingLogDataSet = {
            name: "training-logs",
            rows: [],
            headers: ["loss", "acc"],
            units: ["/", "/"],
            colors: [LOSS_COLOR, ACC_COLOR],
        }
        const set = FieldDataSet.createFromFile(trainingLogDataSet)
        set.addData([0, 0])
        setTrainingLogs(set)
    }

    const deleteTFModel = () => {
        if (confirm("Are you sure you want to delete current model?")) {
            const newModel = new MBModel(model.name)
            prepareModel(newModel)
            setModel(newModel)
            handleModelUpdate(newModel)
        }
    }

    /* For training model */
    const [trainEnabled, setTrainEnabled] = useState(dataset.labels.length >= 2)
    const [trainingLogs, setTrainingLogs] = useState<FieldDataSet>(undefined)

    const trainTFModel = async () => {
        model.status = "running"
        model.inputTypes = dataset.inputTypes
        handleModelUpdate(model)
        setTrainEnabled(false)

        // setup worker
        // subscriber gets messages about training while training is happening
        const stopWorkerSubscribe = workerProxy("tf").subscribe(
            "message",
            (msg: any) => {
                const newData = [msg.data.loss, msg.data.acc]
                if (trainingLogs) trainingLogs.addData(newData)
            }
        )

        const trainMsg = {
            worker: "tf",
            type: "train",
            data: {
                xData: dataset.xs,
                yData: dataset.ys,
                model: model.toJSON(),
                modelBlockJSON: "",
            },
        } as TFModelTrainRequest
        const trainResult = (await trainRequest(
            trainMsg
        )) as TFModelTrainResponse

        // stop subscriber after training
        stopWorkerSubscribe()

        if (trainResult) {
            // handle result from training
            const trainingHistory = trainResult.data.trainingInfo
            model.weightData = trainResult.data.modelWeights
            model.modelJSON = trainResult.data.modelJSON

            console.log("Randi training result ", trainResult)

            // Randi TODO decide when/how to compule arm code
            // Compile code for MCU
            /*const armcompiled = await compileAndTest(model.model, {
                verbose: true,
                includeTest: true,
                float16weights: false,
                optimize: true,
            })
            console.log(armcompiled)*/
            // use armcompiled.machineCode

            // Update model status
            model.status = "completed"
            model.trainingAcc = trainingHistory[trainingHistory.length - 1]
            handleModelUpdate(model)

            setTrainEnabled(true)
        } else {
            model.status = "idle"
            handleModelUpdate(model)
        }
    }

    /* For page management */
    const handleNext = () => {
        onNext(model)
    }
    const handleModelUpdate = model => {
        onChange(model)
    }

    const [expanded, setExpanded] = React.useState<string | false>(false)
    const handleExpandedSummaryChange =
        (panel: string) =>
        (event: React.ChangeEvent<unknown>, isExpanded: boolean) => {
            setExpanded(isExpanded ? panel : false)
        }

    if (!pageReady) return null
    return (
        <Grid container direction={"column"}>
            <Grid item>
                <h3>Model Summary</h3>
                <Accordion
                    expanded={expanded === "modelSummary"}
                    onChange={handleExpandedSummaryChange("modelSummary")}
                >
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <div>
                            {expanded !== "modelSummary" && (
                                <span>
                                    Classes: {model.labels.join(", ")} <br />
                                    Training Status: {model.status} <br />
                                </span>
                            )}
                        </div>
                    </AccordionSummary>
                    <AccordionDetails>
                        <div>
                            {dataset.summary.map((line, lineIdx) => {
                                return (
                                    <span key={"dataset-summary-" + lineIdx}>
                                        {" "}
                                        {line} <br />
                                    </span>
                                )
                            })}
                            {model.summary.map((line, lineIdx) => {
                                return (
                                    <span key={"model-summary-" + lineIdx}>
                                        {" "}
                                        {line} <br />
                                    </span>
                                )
                            })}
                        </div>
                    </AccordionDetails>
                </Accordion>
                <div className={classes.buttons}>
                    <Button
                        size="large"
                        variant="contained"
                        aria-label="delete existing model"
                        title={
                            "Press to delete the machine learning model you have now"
                        }
                        onClick={deleteTFModel}
                        startIcon={<DeleteIcon />}
                        style={{ marginTop: 16 }}
                    >
                        Delete Model
                    </Button>
                </div>
                <div className={classes.buttons}>
                    <Button
                        size="large"
                        variant="contained"
                        color={"primary"}
                        aria-label="start training model"
                        title={
                            trainEnabled
                                ? "Press to start training machine learning model"
                                : "You must have at least two classes to train a model. Go back to first tab."
                        }
                        onClick={trainTFModel}
                        startIcon={<PlayArrowIcon />}
                        disabled={!trainEnabled}
                        style={{ marginTop: 16 }}
                    >
                        Train Model
                    </Button>
                </div>
                <br />
            </Grid>
            <Grid item>
                <h3>Training Results</h3>
                {!!trainingLogs.length && (
                    <div key="liveData">
                        <div>
                            <FiberManualRecordIcon
                                className={classes.vmiddle}
                                fontSize="small"
                                style={{
                                    color: ACC_COLOR,
                                }}
                            />
                            Accuracy
                            <FiberManualRecordIcon
                                className={classes.vmiddle}
                                fontSize="small"
                                style={{
                                    color: LOSS_COLOR,
                                }}
                            />
                            Loss
                            <Trend
                                key="training-trends"
                                height={12}
                                dataSet={trainingLogs}
                                horizon={NUM_EPOCHS}
                                dot={true}
                                gradient={true}
                            />
                        </div>
                    </div>
                )}
                <p>Final Training Accuracy: {model.trainingAcc}</p>
                <br />
            </Grid>

            <Grid item style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className={classes.buttons}>
                    <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<NavigateNextIcon />}
                        disabled={model.status !== "completed"}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div>
            </Grid>
        </Grid>
    )
}
