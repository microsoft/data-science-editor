import React, { lazy, ReactNode, useContext, useEffect, useState } from "react"
import { styled } from "@mui/material/styles"
import { Box, Button, Grid, Tooltip } from "@mui/material"
import Suspense from "../../../ui/Suspense"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import ViewIcon from "@mui/icons-material/Visibility"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import DownloadIcon from "@mui/icons-material/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { predictRequest } from "../../dsl/workers/tf.proxy"
import type { TFModelPredictRequest } from "../../../../workers/tf/dist/node_modules/tf.worker"

import WorkspaceContext, { resolveBlockServices } from "../../WorkspaceContext"
import { CHANGE } from "../../../../../jacdac-ts/src/jdom/constants"

import MBDataSet, { arraysEqual } from "../../../model-editor/MBDataSet"
import MBModel from "../../../model-editor/MBModel"

const PREFIX = "TrainedModelBlockField"

const classes = {
    fieldContainer: `${PREFIX}-fieldContainer`,
    field: `${PREFIX}-field`,
    inlineItem: `${PREFIX}-inlineItem`,
}

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
    [`& .${classes.fieldContainer}`]: {
        lineHeight: "2.5rem",
        width: "15rem",
    },

    [`& .${classes.field}`]: {
        width: theme.spacing(10),
    },

    [`& .${classes.inlineItem}`]: {
        height: theme.spacing(30),
        overflowY: "scroll",
    },
}))

const ConfusionMatrixHeatMap = lazy(
    () => import("../../../model-editor/components/ConfusionMatrixHeatMap")
)
const DataSetPlot = lazy(
    () => import("../../../model-editor/components/DataSetPlot")
)

function TrainedModelDisplayWidget() {
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
        "confusion matrix" | "dataset plot"
    >("confusion matrix")

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

                // make sure dataset and model are compatible (same input data)
                if (
                    !arraysEqual(
                        updatedDataSet.inputTypes,
                        updatedModel.inputTypes
                    ) ||
                    updatedDataSet.length != updatedModel.inputShape[0] ||
                    updatedDataSet.width != updatedModel.inputShape[1]
                ) {
                    setErrorMsg(
                        "The selected dataset does not have the same input/output type as the trained model"
                    )
                    setDataSet(updatedDataSet)
                    setModel(updatedModel)
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
                        if (result && result.data) {
                            // convert prediction result to string
                            const predictions = []
                            result.data.predictTop.forEach(prediction => {
                                predictions.push(
                                    updatedModel.labels[prediction]
                                )
                            })
                            setTrainingPredictionResult(predictions)
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

    const handleViewTrainedModel = () => {
        // open modal to view model
        sourceBlock.data = "click.view"
    }
    const handleDownloadModel = () => {
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
                    <br />
                    {!!model && (
                        <Box color="text.secondary">
                            Model input types: {model.inputTypes.join(", ")}
                            <br />
                            Input shape: [{model.inputShape.join(", ")}]
                        </Box>
                    )}
                    <br />
                    {!!dataSet && (
                        <Box color="text.secondary">
                            Data set input types:{" "}
                            {dataSet.inputTypes.join(", ")}
                            <br />
                            Input shape: [{dataSet.length}, {dataSet.width}]
                        </Box>
                    )}
                </Grid>
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="View this model and perform actions like testing with live data">
                        <Button
                            onClick={handleViewTrainedModel}
                            startIcon={<ViewIcon />}
                            variant="outlined"
                            size="small"
                        >
                            View
                        </Button>
                    </Tooltip>
                    &ensp;
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadModel}
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
                                    yActual={dataSet.ys.map(
                                        val => dataSet.labels[val]
                                    )}
                                    yPredicted={trainingPredictionResult}
                                    labels={model.labels}
                                    timestamp={trainTimestamp}
                                />
                            </Suspense>
                        </PointerBoundary>
                    </Grid>
                )}
                <Grid item style={{ display: "inline-flex" }}>
                    <Tooltip title="View this model and perform actions like testing with live data">
                        <Button
                            onClick={handleViewTrainedModel}
                            startIcon={<ViewIcon />}
                            variant="outlined"
                            size="small"
                        >
                            View
                        </Button>
                    </Tooltip>
                    &ensp;
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadModel}
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
                    <Tooltip title="View this model and perform actions like testing with live data">
                        <Button
                            onClick={handleViewTrainedModel}
                            startIcon={<ViewIcon />}
                            variant="outlined"
                            size="small"
                        >
                            View
                        </Button>
                    </Tooltip>
                    &ensp;
                    <Tooltip title="Download trained model file">
                        <Button
                            onClick={handleDownloadModel}
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
        return (
            <Root>
                <TrainedModelDisplayWidget />
            </Root>
        )
    }

    updateFieldValue(msg: any) {
        this.value = {
            ...(this.value as any),
            ...msg,
        }
    }
}
