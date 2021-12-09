import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { BAR_CORNER_RADIUS, BAR_MAX_ITEMS } from "../../toolbox"

function BarWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))
    const value = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("value"),
        "number"
    )
    if (!index || !value) return null

    const sliceOptions = {
        sliceMax: BAR_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        mark: { type: "bar", cornerRadius: BAR_CORNER_RADIUS, tooltip: true },
        encoding: {
            x: { field: index, type: "nominal", sort: null },
            y: { field: value, type: "quantitative" },
        },
        data: { name: "values" },
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class BarField extends ReactInlineField {
    static KEY = "jacdac_field_bar_plot"
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
