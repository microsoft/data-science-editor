import React, { useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import {
    ScatterPlot,
    ScatterPlotSvgProps,
    Serie,
    Datum,
} from "@nivo/scatterplot"
import useBlockChartProps from "../useBlockChartProps"
import useBlockData from "../useBlockData"
import { tidy, select, rename, mutate } from "@tidyjs/tidy"
import { PointerBoundary } from "./PointerBoundary"

function ChartWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)

    const x = sourceBlock?.getFieldValue("x")
    const y = sourceBlock?.getFieldValue("y")
    const renaming = {}
    renaming[x] = "x"
    renaming[y] = "y"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let index = 0
    const tidied: Datum[] = data
        ? (tidy(
              data,
              mutate({ index: () => index++ }),
              select([x, y]),
              rename(renaming)
          ) as any)
        : []
    const series: Serie[] = [
        {
            id: "data",
            data: tidied,
        },
    ]
    const { chartProps } = useBlockChartProps<ScatterPlotSvgProps>(
        sourceBlock,
        {
            colors: { scheme: "category10" },
            data: series,
            margin: { top: 8, right: 8, bottom: 38, left: 64 },
            xScale: { type: "linear", min: "auto", max: "auto" },
            yScale: { type: "linear", min: "auto", max: "auto" },
            axisTop: null,
            axisRight: null,
            axisBottom: {
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: x,
                legendPosition: "middle",
                legendOffset: 34,
            },
            axisLeft: {
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: y,
                legendPosition: "middle",
                legendOffset: -32,
            },
        }
    )
    if (chartProps) chartProps.data = series
    if (!chartProps?.data) return null

    return (
        <div style={{ background: "#fff", borderRadius: "0.5rem" }}>
            <PointerBoundary>
                <ScatterPlot width={400} height={400} {...chartProps} />
            </PointerBoundary>
        </div>
    )
}

export default class ChartField extends ReactInlineField {
    static KEY = "jacdac_field_chart"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new ChartField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <ChartWidget />
    }
}
