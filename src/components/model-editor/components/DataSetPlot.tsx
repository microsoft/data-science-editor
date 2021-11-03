import React, { lazy, useMemo, useState } from "react"
import { Box, Grid, MenuItem, Select } from "@mui/material"
import FieldDataSet from "../../FieldDataSet"
import Suspense from "../../ui/Suspense"
import MBDataSet from "../MBDataSet"
import { useId } from "react-use-id-hook"

const VegaLite = lazy(() => import("../../blockly/fields/chart/VegaLite"))

export default function DataSetPlot(props: {
    chartProps: any
    reactStyle: any
    dataset: MBDataSet
    predictedLabels: string[]
    timestamp: number
}) {
    const { dataset, predictedLabels, timestamp } = props
    const classes = props.reactStyle
    const chartProps = props.chartProps

    const calculateRecordingFeatures = (
        recording: FieldDataSet,
        label: string,
        predictedLabel: string
    ) => {
        const features = {
            name: recording.name,
            class: label,
            "predicted class": predictedLabel,
            correct: label == predictedLabel || predictedLabel == "",
        }
        const headerNames = []
        for (let idx = 0; idx < recording.width; idx++) {
            // differentiate input types with the same name (e.g. two buttons)
            let headerName = recording.headers[idx]
            headerNames.push(headerName)
            const headerNameCount = headerNames.filter(
                name => name == headerName
            ).length
            if (headerNameCount > 1) headerName += headerNameCount

            // calculate features and add them to the dataset
            features["rms-" + headerName] = recording.rms[idx]
            features["sd-" + headerName] = recording.sd[idx]
            features["max-" + headerName] = recording.maxs[idx]
        }
        return features
    }
    const dataSetPoints = useMemo(() => {
        const setPoints = []

        if (dataset && dataset.totalRecordings) {
            const labels = dataset.labels

            for (const label of labels) {
                dataset.getRecordingsWithLabel(label).forEach(recording => {
                    let predictedLabel = ""
                    // if it exists, grab the predicted label associated with this data point
                    if (predictedLabels && predictedLabels.length)
                        predictedLabel = predictedLabels[setPoints.length]

                    // add data point to chart
                    const recordingFeatures = calculateRecordingFeatures(
                        recording,
                        label,
                        predictedLabel
                    )
                    setPoints.push(recordingFeatures)
                })
            }
        }
        return setPoints
    }, [dataset, predictedLabels, timestamp])
    const features = useMemo(() => {
        const feats = []
        const inputNames = []
        if (dataset) {
            dataset.inputTypes.forEach(inputName => {
                // differentiate input types with the same name (e.g. two buttons)
                inputNames.push(inputName)
                const inputNameCount = inputNames.filter(
                    name => name == inputName
                ).length
                if (inputNameCount > 1) inputName += inputNameCount

                feats.push("rms-" + inputName)
                feats.push("sd-" + inputName)
                feats.push("max-" + inputName)
            })
        }
        return feats.sort()
    }, [dataset])

    const [xAxis, setXAxis] = useState(features[0] || "")
    const [yAxis, setYAxis] = useState(features[1] || "")
    const handleChangedX = event => setXAxis(event.target.value)
    const handleChangedY = event => setYAxis(event.target.value)

    const configTooltip = () => {
        const spec = [
            {
                field: "name",
                type: "nominal",
            },
            {
                field: "class",
                type: "nominal",
            },
            {
                field: xAxis,
                type: "quantitative",
                format: chartProps.TOOLTIP_NUM_FORMAT,
            },
            {
                field: yAxis,
                type: "quantitative",
                format: chartProps.TOOLTIP_NUM_FORMAT,
            },
        ]

        if (predictedLabels && predictedLabels.length) {
            spec.splice(1, 0, {
                field: "predicted class",
                type: "nominal",
            })
        }
        return spec
    }
    const tooltipSpec = configTooltip()

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <Box color="text.secondary">
                    x&ensp;
                    <Select
                        className={classes.field}
                        id={useId() + "xAxis"}
                        variant="outlined"
                        value={xAxis}
                        onChange={handleChangedX}
                    >
                        {features.map(ft => (
                            <MenuItem key={useId()} value={ft}>
                                {ft}
                            </MenuItem>
                        ))}
                    </Select>
                    &emsp;y&ensp;
                    <Select
                        className={classes.field}
                        id={useId() + "yAxis"}
                        variant="outlined"
                        value={yAxis}
                        onChange={handleChangedY}
                    >
                        {features.map(ft => (
                            <MenuItem key={useId()} value={ft}>
                                {ft}
                            </MenuItem>
                        ))}
                    </Select>
                </Box>
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <VegaLite
                        actions={false}
                        spec={{
                            title: { timestamp },
                            width: chartProps.CHART_WIDTH,
                            height: chartProps.CHART_HEIGHT,
                            data: { values: dataSetPoints },
                            mark: {
                                type: "point",
                                size: chartProps.MARK_SIZE,
                                filled: true,
                                angle: 45,
                            },
                            encoding: {
                                x: {
                                    field: xAxis,
                                    type: "quantitative",
                                },
                                y: {
                                    field: yAxis,
                                    type: "quantitative",
                                },
                                color: {
                                    field: "class",
                                    type: "nominal",
                                    scale: {
                                        range: chartProps.PALETTE,
                                    },
                                },
                                shape: {
                                    field: "correct",
                                    type: "nominal",
                                    scale: {
                                        domain: ["true", "false"],
                                        range: ["circle", "cross"],
                                    },
                                    legend: null,
                                },
                                tooltip: tooltipSpec,
                            },
                        }}
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}
