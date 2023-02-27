import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { PIE_MAX_ITEMS } from "../../toolbox"

function PieWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const color = sourceBlock?.getFieldValue("color")
    const value = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("value"),
        "number"
    )

    if (!value || !color) return null

    const sliceOptions = {
        sliceMax: PIE_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        mark: { type: "arc", tooltip: true },
        encoding: {
            theta: {
                field: value,
                type: "quantitative",
                aggregate: "sum",
                stack: "normalize",
            },
            color: { field: color, type: "nominal" },
        },
        data: { name: "values" },
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class PieChartField extends ReactInlineField {
    static KEY = "ds_field_piechart_plot"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new PieChartField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <PieWidget />
    }
}
