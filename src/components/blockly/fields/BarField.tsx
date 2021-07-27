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
import { CHART_HEIGHT, CHART_WIDTH } from "../toolbox"
const Bar = lazy(() => import("./Bar"))

function BarChartWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)

    // need to map data to nivo
    const index = sourceBlock?.getFieldValue("index")
    const value = sourceBlock?.getFieldValue("value")
    const { series, labels } = tidyToNivo(
        data,
        [index, value],
        ["index", "value"]
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { chartProps } = useBlockChartProps<any>(sourceBlock, {
        colors: { scheme: "category10" },
        data: series?.[0]?.data,
        margin: { top: 8, right: 8, bottom: 38, left: 64 },
        indexBy: "index",
        axisTop: null,
        axisRight: null,
        axisBottom: {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: index,
            legendPosition: "middle",
            legendOffset: 34,
        },
        axisLeft: {
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: value,
            legendPosition: "middle",
            legendOffset: -32,
        },
    })
    if (chartProps) chartProps.data = series?.[0]?.data
    const hasData = !!series?.[0]?.data?.length
    if (!hasData) return null

    chartProps.axisBottom.legend = labels[0]
    chartProps.axisLeft.legend = labels[1]

    return (
        <NoSsr>
            <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                <PointerBoundary>
                    <Suspense>
                        <Bar width={CHART_WIDTH} height={CHART_HEIGHT} {...chartProps} />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}

export default class BarChartField extends ReactInlineField {
    static KEY = "jacdac_field_bar_chart"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new BarChartField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <BarChartWidget />
    }
}
