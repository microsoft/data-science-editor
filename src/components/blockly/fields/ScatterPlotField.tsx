import React, { lazy, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import useBlockChartProps from "../useBlockChartProps"
import useBlockData from "../useBlockData"
import { PointerBoundary } from "./PointerBoundary"
import Suspense from "../../ui/Suspense"
import { NoSsr } from "@material-ui/core"
import { tidyToNivo } from "./nivo"
const ScatterPlot = lazy(() => import("./ScatterPlot"))

function ScatterChartWidget() {
    const { sourceBlock, dragging } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)

    // need to map data to nivo
    const x = sourceBlock?.getFieldValue("x")
    const y = sourceBlock?.getFieldValue("y")
    const { series, labels } = tidyToNivo(data, [x, y], ["x", "y"])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { chartProps } = useBlockChartProps<any>(sourceBlock, {
        colors: { scheme: "category10" },
        data: series,
        margin: { top: 8, right: 8, bottom: 38, left: 64 },
        xScale: { type: "linear", min: "auto", max: "auto" },
        yScale: { type: "linear", min: "auto", max: "auto" },
        axisTop: null,
        axisRight: null,
        animate: !dragging,
        isInteractive: !dragging,
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

    const hasData =
        labels?.length === 2 &&
        labels[0] !== labels[1] &&
        !!chartProps?.data?.[0].data?.length
    if (!hasData) return null

    chartProps.axisBottom.legend = labels[0]
    chartProps.axisLeft.legend = labels[1]

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
        return <ScatterChartWidget />
    }
}
