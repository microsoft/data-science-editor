import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { resolveColumns } from "../DataColumnChooserField"

function ScatterPlotMatrixWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))

    const columns = resolveColumns(data, sourceBlock, 4)

    if (columns.length < 3) return null

    const spec: VisualizationSpec = {
        width: 480,
        data: { name: "values" },
        repeat: {
            row: columns.slice(0),
            column: columns.reverse().slice(0),
        },
        spec: {
            width: 76,
            height: 76,
            mark: { type: "point", filled: true },
            encoding: {
                x: {
                    field: { repeat: "column" },
                    type: "quantitative",
                    scale: { zero: false },
                },
                y: {
                    field: { repeat: "row" },
                    type: "quantitative",
                    scale: { zero: false },
                },
                color: index ? { field: index, type: "nominal" } : undefined,
            },
        },
    }

    return <VegaLiteWidget spec={spec} renderer="canvas" />
}

export default class ScatterPlotMatrixField extends ReactInlineField {
    static KEY = "ds_field_scatterplot_matrix_plot"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new ScatterPlotMatrixField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <ScatterPlotMatrixWidget />
    }
}
