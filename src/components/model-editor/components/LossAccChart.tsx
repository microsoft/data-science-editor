import React, { lazy } from "react"
import Suspense from "../../ui/Suspense"

const VegaLite = lazy(() => import("../../charts/VegaLite"))

export default function LossAccChart(props: {
    chartProps: any
    lossData: number[]
    accData: number[]
    timestamp: number
}) {
    const { lossData, accData, timestamp } = props
    const chartProps = props.chartProps

    return (
        <Suspense>
            <VegaLite
                spec={{
                    width: chartProps.CHART_WIDTH,
                    height: chartProps.CHART_HEIGHT,
                    data: { values: accData },
                    mark: {
                        type: "line",
                        interpolate: "monotone",
                    },
                    encoding: {
                        x: { field: "epoch", type: "quantitative" },
                        y: {
                            field: "acc",
                            type: "quantitative",
                        },
                        color: {
                            field: "dataset",
                            type: "nominal",
                            legend: null,
                            scale: {
                                range: chartProps.PALETTE,
                            },
                        },
                    },
                }}
            />
            <VegaLite
                spec={{
                    width: chartProps.CHART_WIDTH,
                    height: chartProps.CHART_HEIGHT,
                    data: { values: lossData },
                    mark: {
                        type: "line",
                        interpolate: "monotone",
                    },
                    encoding: {
                        x: { field: "epoch", type: "quantitative" },
                        y: {
                            field: "loss",
                            type: "quantitative",
                        },
                        color: {
                            field: "dataset",
                            type: "nominal",
                            scale: {
                                range: chartProps.PALETTE,
                            },
                        },
                    },
                }}
            />
        </Suspense>
    )
}
