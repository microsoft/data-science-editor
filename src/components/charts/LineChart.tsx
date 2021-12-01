import React from "react"
import VegaLiteChart from "./VegaLiteChart"
import type { VisualizationSpec } from "react-vega"

const LINE_MAX_ITEMS = 1 << 10

export default function LineChart(props: {
    data: object[]
    x: string
    y: string
    settings?: object
}) {
    const { data, x, y, settings } = props

    const sliceOptions = {
        sliceHead: LINE_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        mark: { type: "line", tooltip: true },
        encoding: {
            x: { field: x, type: "quantitative", scale: { zero: false } },
            y: { field: y, type: "quantitative", scale: { zero: false } },
        },
        data: { name: "values" },
    }
    return (
        <VegaLiteChart
            spec={spec}
            slice={sliceOptions}
            data={data}
            settings={settings}
        />
    )
}
