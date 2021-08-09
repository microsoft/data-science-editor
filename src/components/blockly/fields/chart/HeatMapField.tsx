import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { LINE_MAX_ITEMS } from "../../toolbox"

function HeatMapWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const x = tidyResolveHeader(data, sourceBlock?.getFieldValue("x"))
    const y = tidyResolveHeader(data, sourceBlock?.getFieldValue("y"))
    const color = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("color"),
        "number"
    )
    if (!x || !y || !color) return null

    const sliceOptions = {
        sliceHead: LINE_MAX_ITEMS,
    }
    const spec: VisualizationSpec = {
        mark: { type: "rect", tooltip: true },
        encoding: {
            x: { field: x, type: "ordinal" },
            y: { field: y, type: "ordinal" },
            color: {
                field: color,
                type: "quantitative",
                scale: { zero: false },
            },
        },
        data: { name: "values" },
    }
    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export default class HeatMapPlotField extends ReactInlineField {
    static KEY = "jacdac_field_heat_map"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new HeatMapPlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <HeatMapWidget />
    }
}
