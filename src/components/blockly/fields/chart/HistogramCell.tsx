import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import {
    summarizeCounts,
    tidyResolveHeader,
    tidyResolveHeaderType,
} from "../tidy"
import { BAR_CORNER_RADIUS } from "../../toolbox"

export default function HistogramCell(props: {
    column: string
    transformed: boolean
}) {
    const { transformed, column } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData(sourceBlock)
    const raw = transformed ? transformedData : data
    const field = tidyResolveHeader(raw, column)
    const type = tidyResolveHeaderType(raw, column)

    if (!field) return null

    if (type !== "number") {
        const n = raw.length
        const counts = summarizeCounts(raw, column, 3)
        const vis = counts.slice(0, 2)
        const nvis = vis.reduce((prev, curr) => prev + curr.count, 0)
        const nvisp = vis.reduce(
            (prev, curr) => prev + Math.ceil((curr.count / n) * 100),
            0
        )
        return (
            <table
                style={{ width: "120px", fontSize: "0.7em", border: "none" }}
            >
                {vis.map((props: any, i) => (
                    <tr
                        style={{
                            border: "none",
                            color: props.name ? "" : "red",
                            fontWeight: props.name ? undefined : "bold",
                        }}
                        key={i}
                    >
                        <td style={{ padding: 0, border: "none" }}>
                            {props.name || "[missing]"}
                        </td>
                        <td
                            style={{
                                padding: 0,
                                border: "none",
                                textAlign: "right",
                            }}
                        >
                            {Math.ceil((props.count / n) * 100) + "%"}
                        </td>
                    </tr>
                ))}
                {nvis < n && (
                    <tr>
                        <td style={{ padding: 0, border: "none" }}>
                            Others ({n - nvis})
                        </td>
                        <td
                            style={{
                                padding: 0,
                                border: "none",
                                textAlign: "right",
                            }}
                        >
                            {Math.floor(100 - nvisp) + "%"}
                        </td>
                    </tr>
                )}
            </table>
        )
    }

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
                field,
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
