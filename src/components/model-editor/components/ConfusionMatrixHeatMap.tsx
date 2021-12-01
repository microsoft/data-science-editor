import React, { lazy } from "react"
import { Grid } from "@mui/material"
import Suspense from "../../ui/Suspense"

const VegaLite = lazy(() => import("../../charts/VegaLite"))

export default function ConfusionMatrixHeatMap(props: {
    chartProps: any
    yActual: string[]
    yPredicted: string[]
    labels: string[]
    timestamp: number
}) {
    const { yActual, yPredicted, labels, timestamp } = props
    const chartProps = props.chartProps

    const compileConfusionMatrixData = (
        actualLabel: string[],
        predictedLabel: string[],
        labels: string[]
    ) => {
        if (!yActual || !yPredicted) return []
        if (yActual.length !== yPredicted.length) return []

        const data = []

        // create list of all actual -> predicted label combos
        labels.forEach((actualVal, actualIdx) => {
            labels.forEach((predVal, predIdx) => {
                const dataPoint = {}
                dataPoint["Actual label"] = actualVal
                dataPoint["Predicted label"] = predVal
                dataPoint["Actual index"] = actualIdx
                dataPoint["Predicted index"] = predIdx
                dataPoint["Count"] = 0
                data.push(dataPoint)
            })
        })

        // convert label names to indices
        const actual = actualLabel.map(label => labels.indexOf(label))
        const predicted = predictedLabel.map(label => labels.indexOf(label))

        // iterate through all of the combinations of actual and predicted labels
        actual.forEach((actualVal, idx) => {
            const predIdx = predicted[idx]
            const actualIdx = actual[idx]

            const dataIdx = actualIdx * labels.length + predIdx
            data[dataIdx]["Count"] += 1
        })

        return data
    }
    const confusionMatrix = compileConfusionMatrixData(
        yActual,
        yPredicted,
        labels
    )

    return (
        <Grid container direction="column" spacing={1}>
            <Grid item xs={12}>
                <Suspense>
                    <VegaLite
                        actions={false}
                        spec={{
                            title: { timestamp },
                            width: chartProps.CHART_WIDTH,
                            height: chartProps.CHART_HEIGHT,
                            mark: "rect",
                            data: { values: confusionMatrix },
                            encoding: {
                                x: {
                                    field: "Predicted label",
                                    type: "nominal",
                                },
                                y: { field: "Actual label", type: "nominal" },
                            },
                            layer: [
                                {
                                    mark: "rect",
                                    encoding: {
                                        color: {
                                            field: "Count",
                                            type: "quantitative",
                                            scale: {
                                                range: [
                                                    "#eee",
                                                    chartProps.PALETTE[2],
                                                ],
                                            },
                                        },
                                    },
                                },
                                {
                                    mark: "text",
                                    encoding: {
                                        text: {
                                            field: "Count",
                                            type: "quantitative",
                                        },
                                        color: {
                                            condition: {
                                                test: "datum['Count'] < 1",
                                                value: "#eee",
                                            },
                                            value: "white",
                                        },
                                    },
                                },
                            ],
                        }}
                    />
                </Suspense>
            </Grid>
        </Grid>
    )
}
