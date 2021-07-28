import React, { useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import useBlockData from "../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "./tidy"
import { LINE_MAX_ITEMS } from "../toolbox"

function LinePlotWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const x = tidyResolveHeader(data, sourceBlock?.getFieldValue("x"), "number")
    const y = tidyResolveHeader(data, sourceBlock?.getFieldValue("y"), "number")
    if (!x || !y) return null

    const sliceOptions = {
        sliceHead: LINE_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        description: `Line plot of ${x}x${y}`,
        mark: "line",
        encoding: {
            x: { field: x, type: "quantitative", scale: { zero: false } },
            y: { field: y, type: "quantitative" },
        },
        data: { name: "values" },
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class LinePlotField extends ReactInlineField {
    static KEY = "jacdac_field_line_plot"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new LinePlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <LinePlotWidget />
    }
}
