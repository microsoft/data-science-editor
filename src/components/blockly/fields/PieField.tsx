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
import { CHART_HEIGHT, CHART_WIDTH, PIE_MAX_ITEMS } from "../toolbox"
const Pie = lazy(() => import("./Pie"))

function PieChartWidget() {
    const { sourceBlock, dragging } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)

    // need to map data to nivo
    const id = sourceBlock?.getFieldValue("id")
    const value = sourceBlock?.getFieldValue("value")
    const { series, labels } = tidyToNivo(data, [id, value], ["id", "value"], {
        sliceMax: PIE_MAX_ITEMS,
        sliceColumn: value
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { chartProps } = useBlockChartProps<any>(sourceBlock, {
        data: series,
        margin: { top: 40, right: 96, bottom: 40, left: 96 },
        innerRadius: 0.3,
        padAngle: 0.7,
        cornerRadius: 3,
        sortByValue: false,
        animate: !dragging,
        isInteractive: !dragging,
        activeOuterRadiusOffset: 8,
        borderWidth: 1,
        borderColor: { from: "color", modifiers: [["darker", 0.2]] },
        arcLinkLabelsSkipAngle: 10,
        arcLinkLabelsTextColor: "#333333",
        arcLinkLabelsThickness: 2,
        arcLinkLabelsColor: { from: "color" },
        arcLabelsSkipAngle: 10,
        arcLabelsTextColor: { from: "color", modifiers: [["darker", 2]] },
        arcLinkLabelsStraightLength: 12,
        arcLinkLabelsDiagonalLength: 6,
    })
    if (chartProps) chartProps.data = series?.[0]?.data
    const hasData =
        labels?.length === 2 &&
        labels[0] !== labels[1] &&
        !!chartProps?.data?.length
    if (!hasData) return null

    return (
        <NoSsr>
            <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                <PointerBoundary>
                    <Suspense>
                        <Pie
                            width={CHART_WIDTH}
                            height={CHART_HEIGHT}
                            {...chartProps}
                        />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}

export default class PiePlotField extends ReactInlineField {
    static KEY = "jacdac_field_pie_plot"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new PiePlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <PieChartWidget />
    }
}
