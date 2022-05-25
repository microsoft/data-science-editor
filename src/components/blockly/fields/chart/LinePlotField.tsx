import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { LINE_MAX_ITEMS, resolveBlockDefinition } from "../../toolbox"

function LinePlotWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const def = resolveBlockDefinition(sourceBlock.type)
    const x = tidyResolveHeader(
        data,
        def.args0[0].name === "x" ? sourceBlock?.getFieldValue("x") : "time",
        "number"
    )
    const ys = ["y", "y2", "y3"]
        .map(n =>
            tidyResolveHeader(data, sourceBlock?.getFieldValue(n), "number")
        )
        .filter(y => !!y)
    if (!x || !ys.length) return null

    const timeSeries = x === "time"

    const sliceOptions = {
        sliceHead: LINE_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        layer: ys.map(y => ({
            mark: {
                type: "line",
                tooltip: true,
                point: { filled: timeSeries },
            },
            encoding: {
                x: { field: x, type: "quantitative", scale: { zero: false } },
                y: { field: y, type: "quantitative", scale: { zero: false } },
            },
            data: { name: "values" },
        })),
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class LinePlotField extends ReactInlineField {
    static KEY = "jacdac_field_line_plot"
    EDITABLE = false

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
