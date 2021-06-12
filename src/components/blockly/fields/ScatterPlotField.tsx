import React, { lazy, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import useBlockChartProps from "../useBlockChartProps"
import useBlockData from "../useBlockData"
import { tidy, select, rename, mutate } from "@tidyjs/tidy"
import { PointerBoundary } from "./PointerBoundary"
import Suspense from "../../ui/Suspense"
import { NoSsr } from "@material-ui/core"
const ScatterPlot = lazy(() => import("./ScatterPlot"))

function ChartWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)

    const x = sourceBlock?.getFieldValue("x")
    const y = sourceBlock?.getFieldValue("y")
    const renaming = {}
    renaming[x] = "x"
    renaming[y] = "y"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // todo handle time
    let index = 0
    const tidied: { x: number; y: number }[] = data
        ? (tidy(
              data,
              mutate({ index: () => index++ }),
              select([x, y]),
              rename(renaming)
          ) as any)
        : []
    const series: { id: string; data: { x: number; y: number }[] }[] = [
        {
            id: "data",
            data: tidied,
        },
    ]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { chartProps } = useBlockChartProps<any>(sourceBlock, {
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
    })
    if (chartProps) chartProps.data = series
    const hasData = !!chartProps?.data?.[0].data?.length
    if (!hasData) return null

    chartProps.axisBottom.legend = x
    chartProps.axisLeft.legend = y

    return (
        <NoSsr>
            <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                <PointerBoundary>
                    <Suspense>
                        <ScatterPlot width={388} height={240} {...chartProps} />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}

export default class ScatterPlotField extends ReactInlineField {
    static KEY = "jacdac_field_scatter_plot"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new ScatterPlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <ChartWidget />
    }
}
