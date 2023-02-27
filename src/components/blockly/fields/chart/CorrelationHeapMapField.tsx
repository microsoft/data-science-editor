import React from "react"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"

function CorrelationHeatMapWidget() {
    const spec: VisualizationSpec = {
        mark: { type: "rect", tooltip: true },
        config: {
            axis: { grid: true, tickBand: "extent" },
        },
        encoding: {
            x: {
                field: "row",
                type: "nominal",
                sort: "ascending",
                axis: { title: null },
            },
            y: {
                field: "column",
                type: "nominal",
                sort: "ascending",
                axis: { title: null },
            },
            color: {
                field: "correlation",
                type: "quantitative",
            },
        },
        data: { name: "values" },
    }
    return <VegaLiteWidget transformed={true} spec={spec} />
}

export default class CorrelationHeatMapField extends ReactInlineField {
    static KEY = "ds_field_correlation_heat_map"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new CorrelationHeatMapField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <CorrelationHeatMapWidget />
    }
}
