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
        const counts = summarizeCounts(raw, column)
        return (
            <table
                style={{ width: "120px", fontSize: "0.7em", border: "none" }}
            >
                {counts.map((props: any, i) => (
                    <tr style={{ border: "none" }} key={i}>
                        <td style={{ padding: 0, border: "none" }}>
                            {props.name} &nbsp; ({props.count})
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
