import React, { lazy, useContext, useState, useMemo } from "react"
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Grid,
    LinearProgress,
} from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import NavigateNextIcon from "@material-ui/icons/NavigateNext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import NavigateBackIcon from "@material-ui/icons/NavigateBefore"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import DownloadIcon from "@material-ui/icons/GetApp"
import IconButtonWithTooltip from "../../ui/IconButtonWithTooltip"
import Suspense from "../../ui/Suspense"

import ServiceManagerContext from "../../ServiceManagerContext"

import { trainRequest } from "../../blockly/dsl/workers/tf.proxy"
import Blockly, { WorkspaceSvg } from "blockly"

import type {
    TFModelTrainRequest,
    TFModelTrainResponse,
} from "../../../workers/tf/dist/node_modules/tf.worker"
import workerProxy from "../../blockly/dsl/workers/proxy"

import MBModel from "../../model-editor/MBModel"
import MBDataSet from "../../model-editor/MBDataSet"

import { PointerBoundary } from "../../blockly/fields/PointerBoundary"

const LossAccChart = lazy(
    () => import("../../model-editor/components/LossAccChart")
)
const ModelSummaryDropdown = lazy(
    () => import("../../model-editor/components/ModelSummaryDropdown")
)
const ModelOutput = lazy(() => import("../../model-editor/ModelOutput"))

export default function TrainModelDialog(props: {
    classes: any
    chartPalette: string[]
    open: boolean
    onModelUpdate: (model: MBModel, blockId: string) => void
    onDone: () => void
    dataset: MBDataSet
    model: MBModel
    trainedModelCount: number
    workspace: WorkspaceSvg
}) {
    const {
        classes,
        chartPalette,
        open,
        onModelUpdate,
        onDone,
        dataset,
        model,
        trainedModelCount,
        workspace,
    } = props

    const chartProps = {
        CHART_WIDTH: 300,
        CHART_HEIGHT: 300,
        MARK_SIZE: 75,
        TOOLTIP_NUM_FORMAT: "0.2f",
        PALETTE: chartPalette,
    }
    const { fileStorage } = useContext(ServiceManagerContext)

    const [dialogType, setDialogType] = useState<"trainModel" | "testModel">(
        "trainModel"
    )

    /* For training model */
    const [trainEnabled, setTrainEnabled] = useState(model.status !== "empty")
    const [predictEnabled, setPredictEnabled] = useState(
        model.status == "trained"
    )

    // for loss/acc graph
    const trainingLossLog = useMemo(() => {
        return []
    }, [])
    const trainingAccLog = useMemo(() => {
        return []
    }, [])
    const [trainingProgress, setTrainingProgress] = useState(0)

    const trainTFModel = async () => {
        model.status = "training"
        model.inputTypes = dataset.inputTypes

        // reset logs and progress
        trainingLossLog.splice(0, trainingLossLog.length)
        trainingAccLog.splice(0, trainingAccLog.length)
        setTrainingProgress(0)

        // disable train model button
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
                xData: dataset.xs,
                yData: dataset.ys,
                model: model.toJSON(),
                trainingParams: model.trainingParams,
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

            // Update model status
            model.status = "trained"
            model.trainingAcc = trainingHistory[trainingHistory.length - 1]
            addNewTrainedModelBlock()
            setTrainEnabled(true)
            setPredictEnabled(true)
        } else model.status = "untrained"
    }
    const addNewTrainedModelBlock = () => {
        // Create new trained model block
        const trainedModelName = model.name + "." + trainedModelCount
        const dataSetName = dataset.name

        const newBlock = Blockly.Xml.domToBlock(
            Blockly.Xml.textToDom(
                `<block type="model_block_trained_nn"><field name="TRAINED_MODEL_NAME">${trainedModelName}</field><field name="MODEL_TEST_SET" variabletype="ModelBlockDataSet">${dataSetName}</field><field name="SELECTED_CHART">confusion matrix</field></block>`
            ),
            workspace
        )

        onModelUpdate(model, newBlock.id)
    }

    /* For interface controls */
    const handleCancel = () => {
        // close the modal
        onDone()
    }
    const handleBack = () => {
        // go to the previous page
        setDialogType("trainModel")
    }
    const handleNext = () => {
        // go to the next page
        setDialogType("testModel")
    }
    const handleDownloadModel = () => {
        // TODO also download arm model (as a zip file?)
        fileStorage.saveText(`${model.name}.json`, JSON.stringify(model))
    }

    if (dialogType == "trainModel")
        return (
            <PointerBoundary>
                <Dialog
                    open={open}
                    onClose={handleCancel}
                    fullWidth={true}
                    maxWidth={"md"}
                >
                    <DialogContent>
                        <Grid container direction={"column"}>
                            <Grid item>
                                <h3>
                                    Current Model
                                    <IconButtonWithTooltip
                                        onClick={handleDownloadModel}
                                        title="Download all recording data"
                                        disabled={dataset.totalRecordings == 0}
                                    >
                                        <DownloadIcon />
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
                                <span style={{ float: "right" }}>
                                    {trainingProgress} / 100
                                </span>
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
                                    Final Training Accuracy:{" "}
                                    {model.status == "untrained"
                                        ? "Model has not been trained"
                                        : (model.trainingAcc || 0).toPrecision(
                                              2
                                          )}
                                </p>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="contained" onClick={handleCancel}>
                            Close
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<NavigateNextIcon />}
                            disabled={!predictEnabled}
                            onClick={handleNext}
                        >
                            Next
                        </Button>
                    </DialogActions>
                </Dialog>
            </PointerBoundary>
        )
    else if (dialogType == "testModel")
        return (
            <PointerBoundary>
                <Dialog
                    open={open}
                    onClose={handleCancel}
                    fullWidth={true}
                    maxWidth={"md"}
                >
                    <DialogContent>
                        <ModelOutput
                            chartProps={chartProps}
                            reactStyle={classes}
                            chartPalette={chartPalette}
                            model={model}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            startIcon={<NavigateBackIcon />}
                            onClick={handleBack}
                        >
                            Back
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            disabled={false}
                            onClick={handleCancel}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
            </PointerBoundary>
        )
}
