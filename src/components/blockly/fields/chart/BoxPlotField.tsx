import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { BAR_CORNER_RADIUS } from "../../toolbox"

function BoxPlotWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))
    const value = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("value"),
        "number"
    )
    if (!index || !value) return null

    const spec: VisualizationSpec = {
        mark: {
            type: "boxplot",
            cornerRadius: BAR_CORNER_RADIUS,
            tooltip: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        encoding: {
            y: { field: index, type: "nominal", scale: { zero: false } },
            x: { field: value, type: "quantitative", scale: { zero: false } },
            color: { field: index, type: "nominal", legend: null },
            tooltip: {
                field: value,
                type: "quantitative",
            },
        },
        data: { name: "values" },
    }

    return <VegaLiteWidget spec={spec} />
}

export default class BoxPlotField extends ReactInlineField {
    static KEY = "ds_field_box_plot"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new BoxPlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <BoxPlotWidget />
    }
}
