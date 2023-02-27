import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { BAR_CORNER_RADIUS, BAR_MAX_ITEMS } from "../../toolbox"

const stacks = {
    stack: "zero",
    unstack: null,
    normalize: "normalize",
}

const nonSummative = ["mean", "median", "variance", "stdev", "min", "max"]

function BarWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))
    const yAggregate = sourceBlock?.getFieldValue("yAggregate") || "mean"
    const group = sourceBlock?.getFieldValue("group")
    const value = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("value"),
        "number"
    )
    let stackValue = sourceBlock?.getFieldValue("stack")
    if (nonSummative.includes(yAggregate)) stackValue = "xOffset"
    const stack = stacks[stackValue]
    if (!index || !value) return null

    const sliceOptions = {
        sliceMax: BAR_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        mark: { type: "bar", cornerRadius: BAR_CORNER_RADIUS, tooltip: true },
        encoding: {
            x: { field: index, type: "nominal", sort: null },
            y: { field: value, type: "quantitative", stack },
        },
        data: { name: "values" },
    }
    if (yAggregate !== undefined)
        (spec.encoding.y as any).aggregate = yAggregate
    // stacking
    if (stack === null) spec.encoding.opacity = { value: 0.7 }
    if (stackValue === "xOffset" && group) {
        spec.encoding.xOffset = { field: group }
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class BarField extends ReactInlineField {
    static KEY = "ds_field_bar_plot"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new BarField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <BarWidget />
    }
}
