import React, { lazy, ReactNode, useContext, useEffect, useState } from "react"
import {
    Box,
    Button,
    Grid,
    Tooltip,
    makeStyles,
    Theme,
    createStyles,
} from "@material-ui/core"
import Suspense from "../../../ui/Suspense"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import DownloadIcon from "@material-ui/icons/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { predictRequest } from "../../dsl/workers/tf.proxy"
import type { TFModelPredictRequest } from "../../../../workers/tf/dist/node_modules/tf.worker"

import WorkspaceContext, { resolveBlockServices } from "../../WorkspaceContext"
import { CHANGE } from "../../../../../jacdac-ts/src/jdom/constants"

import MBDataSet, { arraysEqual } from "../../../model-editor/MBDataSet"
import MBModel from "../../../model-editor/MBModel"

const ModelSummary = lazy(
    () => import("../../../model-editor/components/ModelSummary")
)
const ConfusionMatrixHeatMap = lazy(
    () => import("../../../model-editor/components/ConfusionMatrixHeatMap")
)
const DataSetPlot = lazy(
    () => import("../../../model-editor/components/DataSetPlot")
)

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        fieldContainer: {
            lineHeight: "2.5rem",
            width: "15rem",
        },
        field: {
            width: theme.spacing(10),
        },
        inlineItem: {
            height: theme.spacing(30),
            overflowY: "scroll",
        },
    })
)

function TrainedModelDisplayWidget() {
    const classes = useStyles()
    const chartProps = {
        CHART_WIDTH: 150,
        CHART_HEIGHT: 150,
        MARK_SIZE: 75,
        TOOLTIP_NUM_FORMAT: "0.2f",
        PALETTE: [
            "#003f5c",
            "#ffa600",
            "#665191",
            "#a05195",
            "#ff7c43",
            "#d45087",
            "#f95d6a",
            "#2f4b7c",
        ],
    }

    const [chartType, setChartType] = useState<
        "model summary" | "confusion matrix" | "dataset plot"
    >("model summary")

    const { sourceBlock } = useContext(WorkspaceContext)
    const services = resolveBlockServices(sourceBlock)

    const [dataSet, setDataSet] = useState(undefined)
    const [model, setModel] = useState(undefined)
    const [trainingPredictionResult, setTrainingPredictionResult] =
        useState(undefined)
    const [trainTimestamp, setTrainTimestamp] = useState(Date.now())
    const [errorMsg, setErrorMsg] = useState("")

    // track workspace changes and re-render
    useEffect(
        () =>
            services?.subscribe(CHANGE, () => {
                sourceBlock.data = "click.refreshdisplay"

                if (!services.data) {
                    setErrorMsg("Please select a valid dataset")
                    return
                }
                setErrorMsg("")

                // grab the model and dataset to test with
                const updatedDataSet = services.data[0] as MBDataSet
                const updatedModel = services.data[1] as MBModel

                if (!updatedModel || !updatedDataSet) return

                // make sure dataset and model are compatible (same input and output data)
                if (
                    !arraysEqual(
                        updatedDataSet.inputTypes,
                        updatedModel.inputTypes
                    ) ||
                    updatedDataSet.length != updatedModel.inputShape[0] ||
                    updatedDataSet.width != updatedModel.inputShape[1] ||
                    !arraysEqual(updatedDataSet.labels, updatedModel.labels)
                ) {
                    setErrorMsg(
                        "The selected dataset does not have the same input/output type as the trained model"
                    )
                    return
                }
                setErrorMsg("")

                // get selected chart
                const selectedChart = sourceBlock
                    .getField("SELECTED_CHART")
                    .getText()

                // for confusion matrix and dataset plot predict on dataset
                if (
                    selectedChart == "confusion matrix" ||
                    selectedChart == "dataset plot"
                ) {
                    const predictMsg = {
                        worker: "tf",
                        type: "predict",
                        data: {
                            zData: updatedDataSet.xs,
                            model: updatedModel.toJSON(),
                        },
                    } as TFModelPredictRequest
                    predictRequest(predictMsg).then(result => {
                        if (result) {
                            // Save probability for each class in model object
                            setTrainingPredictionResult(result.data.predictTop)
                            setTrainTimestamp(Date.now())
                        }
                    })
                }

                setDataSet(updatedDataSet)
                setModel(updatedModel)
                setChartType(selectedChart)
            }),
        [services]
    )

    const handleDownloadDataSet = () => {
        // set the model name to what the user typed into the box
        const trainedModelName = sourceBlock
            .getField("TRAINED_MODEL_NAME")
            .getText()
        if (model) model.name = trainedModelName

        sourceBlock.data = "click.download"
    }

    if (errorMsg.length)
        return (
            <Grid container spacing={1} direction={"column"}>
                <Grid item>
                    <Box color="text.secondary">
                        Error: {errorMsg}
                        <br />
                    </Box>
                    {!!model && (
                        <Box color="text.secondary">
                            Input Types: {model.inputTypes.join(", ")}
                            <br />
                            Input Shape: [{model.inputShape.join(", ")}]<br />
                            Classes: {model.labels.join(", ")}
                        </Box>
                    )}
                </Grid>
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadDataSet}
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        )
    else if (chartType == "model summary")
        return (
            <Grid container spacing={1} direction={"column"}>
                {!!model && !!dataSet && (
                    <Grid item>
                        <Box
                            color="text.secondary"
                            className={classes.inlineItem}
                        >
                            <PointerBoundary>
                                <Suspense>
                                    <ModelSummary
                                        reactStyle={classes}
                                        dataset={dataSet}
                                        model={model}
                                    />
                                </Suspense>
                            </PointerBoundary>
                        </Box>
                    </Grid>
                )}
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadDataSet}
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        )
    else if (chartType == "confusion matrix")
        return (
            <Grid container spacing={1} direction={"column"}>
                {!!model && !!dataSet && (
                    <Grid item>
                        <PointerBoundary>
                            <Suspense>
                                <ConfusionMatrixHeatMap
                                    chartProps={chartProps}
                                    yActual={dataSet.ys}
                                    yPredicted={trainingPredictionResult}
                                    labels={model.labels}
                                    timestamp={trainTimestamp}
                                />
                            </Suspense>
                        </PointerBoundary>
                    </Grid>
                )}
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadDataSet}
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        )
    else if (chartType == "dataset plot")
        return (
            <Grid container spacing={1} direction={"column"}>
                {!!model && !!dataSet && (
                    <Grid item>
                        <PointerBoundary>
                            <Suspense>
                                <DataSetPlot
                                    chartProps={chartProps}
                                    reactStyle={classes}
                                    dataset={dataSet}
                                    predictedLabels={trainingPredictionResult}
                                    timestamp={trainTimestamp}
                                />
                            </Suspense>
                        </PointerBoundary>
                    </Grid>
                )}
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadDataSet}
                            startIcon={<DownloadIcon />}
                            variant="outlined"
                            size="small"
                        >
                            Download
                        </Button>
                    </Tooltip>
                </Grid>
            </Grid>
        )
}

export default class TrainedModelBlockField extends ReactInlineField {
    static KEY = "trained_model_block_field_key"

    constructor(value: string) {
        super(value)
    }

    static fromJson(options: ReactFieldJSON) {
        return new TrainedModelBlockField(options?.value)
    }

    getText_() {
        return ``
    }

    renderInlineField(): ReactNode {
        return <TrainedModelDisplayWidget />
    }

    updateFieldValue(msg: any) {
        this.value = {
            ...this.value,
            ...msg,
        }
    }
}
