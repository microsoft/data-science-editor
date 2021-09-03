import { Button, Grid, LinearProgress } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import NavigateNextIcon from "@material-ui/icons/NavigateNext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import DownloadIcon from "@material-ui/icons/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DeleteAllIcon from "@material-ui/icons/DeleteSweep"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import React, { lazy, useContext, useEffect, useState } from "react"
import Suspense from "../ui/Suspense"

import ServiceManagerContext from "../ServiceManagerContext"

import {
    compileRequest,
    trainRequest,
    predictRequest,
} from "../blockly/dsl/workers/tf.proxy"
import type {
    TFModelCompileRequest,
    TFModelTrainRequest,
    TFModelTrainResponse,
    TFModelPredictRequest,
    TFModelPredictResponse,
} from "../../workers/tf/dist/node_modules/tf.worker"
import workerProxy from "../blockly/dsl/workers/proxy"

import MBDataSet, { arraysEqual } from "./MBDataSet"
import MBModel, { DEFAULT_MODEL } from "./MBModel"

const ConfusionMatrixHeatMap = lazy(
    () => import("./components/ConfusionMatrixHeatMap")
)
const DataSetPlot = lazy(() => import("./components/DataSetPlot"))
const LossAccChart = lazy(() => import("./components/LossAccChart"))
const ModelSummaryDropdown = lazy(
    () => import("./components/ModelSummaryDropdown")
)

export function prepareDataSet(set: MBDataSet) {
    // Assumptions: the sampling rate, sampling duration, and sensors used are constant
    let sampleLength = -1
    let sampleChannels = -1
    const xData = []
    const yData = []

    for (const label of set.labels) {
        set.getRecordingsWithLabel(label).forEach(table => {
            sampleChannels = table.width
            if (table.width != sampleChannels) {
                alert(
                    "All input data must have the same shape: " +
                        table.name +
                        "\n Has " +
                        table.width +
                        " inputs instead of " +
                        sampleChannels
                )
            } /* else if (table.length != sampleLength) {
                // TODO decide what to do about data with different weight
            } */
            // For x data, just add each sample as a new row into x_data
            xData.push(table.data())

            yData.push(set.labels.indexOf(label))
        })
    }

    // save tensors with dataset object
    set.xs = xData
    set.ys = yData
    set.length = xData[0].length
    set.width = xData[0][0].length
}

export function prepareModel(
    mod: MBModel,
    set: MBDataSet,
    callback: (model: MBModel) => void
) {
    // get model set up with dataset features
    mod.labels = set.labels
    mod.inputShape = [set.length, set.width]
    mod.inputTypes = set.inputTypes
    mod.inputInterval = set.interval
    mod.outputShape = set.labels.length

    /* compile model */
    const compileMsg = {
        worker: "tf",
        type: "compile",
        data: {
            modelBlockJSON: mod.blockJSON || DEFAULT_MODEL,
            model: mod.toJSON(),
        },
    } as TFModelCompileRequest

    // TODO throw an error if this never returns, page needs refresh
    compileRequest(compileMsg).then(result => {
        if (result) {
            mod.modelJSON = result.data.modelJSON || ""
            const modelStats = result.data.modelStats
            if (modelStats.length > 2)
                mod.modelStats = { total: modelStats.pop(), layers: modelStats }
            mod.trainingParams = result.data.trainingParams
            mod.status = "untrained"
        }
        if (callback) callback(mod)
    })
}

export default function TrainModel(props: {
    chartProps: any
    reactStyle: any
    dataset: MBDataSet
    model: MBModel
    onChange: (model) => void
    onNext: (model) => void
}) {
    const classes = props.reactStyle
    const chartProps = props.chartProps
    const { fileStorage } = useContext(ServiceManagerContext)

    const { dataset, model, onChange, onNext } = props

    useEffect(() => {
        prepareDataSet(dataset)

        if (
            !arraysEqual(model.labels, dataset.labels) ||
            !arraysEqual(model.inputTypes, dataset.inputTypes)
        ) {
            // If there is already a model, make sure it matches the current dataset
            //   if it does not, reset the model
            const newModel = new MBModel(model.name)
            prepareModel(newModel, dataset, undefined)
            handleModelUpdate(newModel)
        } else {
            prepareModel(model, dataset, undefined)
            handleModelUpdate(model)
        }

        // ready to train
        setTrainEnabled(model.modelJSON != "empty")
    }, [])

    /* For training model */
    const [trainEnabled, setTrainEnabled] = useState(false)
    const [trainingProgress, setTrainingProgress] = useState(0)
    const [trainingLossLog, setTrainingLossLog] = useState([])
    const [trainingAccLog, setTrainingAccLog] = useState([])
    const [trainingPredictionResult, setTrainingPredictionResult] = useState([])
    const [trainTimestamp, setTrainTimestamp] = useState(0)

    const trainTFModel = async () => {
        model.status = "training"
        model.inputTypes = dataset.inputTypes
        handleModelUpdate(model)

        // reset logs and progress
        trainingLossLog.splice(0, trainingLossLog.length)
        trainingAccLog.splice(0, trainingAccLog.length)
        setTrainingProgress(0)

        setTrainEnabled(false)

        // setup worker
        // subscriber gets messages about training while training is happening
        const stopWorkerSubscribe = workerProxy("tf").subscribe(
            "message",
            (msg: any) => {
                const epoch = trainingLossLog.length / 2 + 1
                trainingLossLog.push({
                    epoch: epoch,
                    loss: msg.data.loss,
                    dataset: "training",
                })
                trainingLossLog.push({
                    epoch: epoch,
                    loss: msg.data.val_loss,
                    dataset: "validation",
                })
                trainingAccLog.push({
                    epoch: epoch,
                    acc: msg.data.acc,
                    dataset: "training",
                })
                trainingAccLog.push({
                    epoch: epoch,
                    acc: msg.data.val_acc,
                    dataset: "validation",
                })
                setTrainingProgress((epoch * 100) / model.trainingParams.epochs)
            }
        )

        const trainMsg = {
            worker: "tf",
            type: "train",
            data: {
                trainingParams: model.trainingParams,
                model: model.toJSON(),
                xData: dataset.xs,
                yData: dataset.ys,
            },
        } as TFModelTrainRequest
        const trainResult = (await trainRequest(
            trainMsg
        )) as TFModelTrainResponse
        // stop subscriber after training
        stopWorkerSubscribe()

        if (trainResult && trainResult.data) {
            // handle result from training
            const trainingHistory = trainResult.data.trainingLogs
            model.weightData = trainResult.data.modelWeights
            model.armModel = trainResult.data.armModel

            // evaluate on training dataset
            const predictMsg = {
                worker: "tf",
                type: "predict",
                data: {
                    zData: dataset.xs,
                    model: model.toJSON(),
                },
            } as TFModelPredictRequest
            const predResult = (await predictRequest(
                predictMsg
            )) as TFModelPredictResponse

            if (predResult) {
                // convert prediction result to string
                const predictions = predResult.data.predictTop.map(
                    prediction => {
                        return model.labels[prediction]
                    }
                )
                setTrainingPredictionResult(predictions)
                setTrainTimestamp(Date.now())
            }

            // Update model status
            model.status = "trained"
            model.trainingAcc = trainingHistory[trainingHistory.length - 1]
            handleModelUpdate(model)

            setTrainEnabled(true)
        } else {
            model.status = "untrained"
            handleModelUpdate(model)
            setTrainEnabled(true)
        }
    }

    /* For page management */
    const handleNext = () => {
        onNext(model)
    }
    const handleModelUpdate = model => {
        onChange(model)
    }
    const handleDownloadModel = () => {
        // TODO also download arm model (as a zip file?)
        fileStorage.saveText(`${model.name}.json`, JSON.stringify(model))
    }
    const deleteTFModel = () => {
        if (confirm("Are you sure you want to delete current model?")) {
            const newModel = new MBModel(model.name)
            prepareModel(newModel, dataset, undefined)

            handleModelUpdate(newModel)

            setTrainingLossLog([])
            setTrainingAccLog([])
        }
    }

    return (
        <Grid container direction={"column"}>
            <Grid item>
                <h3>
                    Current Model
                    <IconButtonWithTooltip
                        onClick={handleDownloadModel}
                        title="Download the trained model"
                        disabled={model.status != "trained"}
                    >
                        <DownloadIcon />
                    </IconButtonWithTooltip>
                    <IconButtonWithTooltip
                        onClick={deleteTFModel}
                        title="Delete current model information"
                    >
                        <DeleteAllIcon />
                    </IconButtonWithTooltip>
                </h3>
                <Suspense>
                    <ModelSummaryDropdown
                        reactStyle={classes}
                        dataset={dataset}
                        model={model}
                    />
                </Suspense>
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
                <h3>Training Progress</h3>
                <LinearProgress
                    variant="determinate"
                    value={trainingProgress}
                />
                <span style={{ float: "right" }}>{trainingProgress} / 100</span>
                <br />
                {!!trainingLossLog.length && (
                    <div key="vega-loss-acc-charts">
                        <Suspense>
                            <LossAccChart
                                chartProps={chartProps}
                                lossData={trainingLossLog}
                                accData={trainingAccLog}
                                timestamp={trainingProgress}
                            />
                        </Suspense>
                    </div>
                )}
                <p>
                    Final training accuracy:{" "}
                    {model.status == "trained"
                        ? (model.trainingAcc || 0).toPrecision(2)
                        : "Model has not been trained"}
                </p>
            </Grid>
            <Grid item>
                <h3>Training Results</h3>
                {!!trainingPredictionResult.length && (
                    <div key="vega-training-set-charts">
                        <Suspense>
                            <ConfusionMatrixHeatMap
                                chartProps={chartProps}
                                yActual={dataset.ys.map(
                                    val => dataset.labels[val]
                                )}
                                yPredicted={trainingPredictionResult}
                                labels={model.labels}
                                timestamp={trainTimestamp}
                            />
                        </Suspense>
                        <br />
                        <Suspense>
                            <DataSetPlot
                                chartProps={chartProps}
                                reactStyle={classes}
                                dataset={dataset}
                                predictedLabels={trainingPredictionResult}
                                timestamp={trainTimestamp}
                            />
                        </Suspense>
                    </div>
                )}
                <br />
            </Grid>
            <Grid item style={{ display: "flex", justifyContent: "flex-end" }}>
                <div className={classes.buttons}>
                    <Button
                        variant="contained"
                        color="secondary"
                        endIcon={<NavigateNextIcon />}
                        disabled={model.status !== "trained"}
                        onClick={handleNext}
                    >
                        Next
                    </Button>
                </div>
            </Grid>
        </Grid>
    )
}
