import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"

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
        description: `Box plot of ${index}`,
        mark: "boxplot",
        encoding: {
            x: { field: index, type: "nominal" },
            y: { field: value, type: "quantitative", scale: { zero: false } },
        },
        data: { name: "values" },
    }

    return <VegaLiteWidget spec={spec} />
}

export default class BoxPlotField extends ReactInlineField {
    static KEY = "jacdac_field_box_plot"
    static EDITABLE = false

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
