import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { BAR_CORNER_RADIUS } from "../../toolbox"

function HistogramWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))

    if (!index) return null

    const spec: VisualizationSpec = {
        mark: { type: "bar", cornerRadius: BAR_CORNER_RADIUS, tooltip: true },
        encoding: {
            x: { bin: true, field: index },
            y: { aggregate: "count" },
        },
        data: { name: "values" },
    }

    return <VegaLiteWidget spec={spec} />
}

export default class HistogramField extends ReactInlineField {
    static KEY = "ds_field_histogram"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new HistogramField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <HistogramWidget />
    }
}
