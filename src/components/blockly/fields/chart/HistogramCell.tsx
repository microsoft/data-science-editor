import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { BAR_CORNER_RADIUS } from "../../toolbox"

export default function HistogramCell(props: {
    column: string
    transformed: boolean
}) {
    const { transformed, column } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData(sourceBlock)
    const raw = transformed ? transformedData : data
    const index = tidyResolveHeader(raw, column, "number")

    if (!index) return null

    const spec: VisualizationSpec = {
        view: null,
        mark: {
            type: "area",
            interpolate: "step",
            cornerRadius: BAR_CORNER_RADIUS,
            tooltip: true,
        },
        encoding: {
            x: {
                bin: { maxbins: 20 },
                field: index,
                axis: {
                    domain: false,
                    ticks: false,
                    labelBound: true,
                    title: null,
                    grid: false,
                },
            },
            y: {
                aggregate: "count",
                axis: {
                    title: null,
                    ticks: null,
                    domain: null,
                    labelBound: true,
                    grid: false,
                },
            },
            color: { legend: null },
        },
        data: { name: "values" },
    }

    return (
        <VegaLiteWidget
            charHeight={76}
            chartWidth={140}
            hideChrome={true}
            spec={spec}
            transformed={transformed}
        />
    )
}
