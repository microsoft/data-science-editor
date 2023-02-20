import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import type { VisualizationSpec } from "react-vega"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyHeaders, tidyResolveHeader } from "../tidy"

function PairsWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const index = tidyResolveHeader(data, sourceBlock?.getFieldValue("index"))

    const { headers, types } = tidyHeaders(data)
    const columns = headers.filter((h, i) => types[i] === "number")

    const spec: VisualizationSpec = {
        width: 480,
        data: { name: "values" },
        repeat: {
            row: columns.slice(0),
            column: columns.reverse().slice(0),
        },
        spec: {
            width: 72,
            height: 72,
            mark: "point",
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

    return <VegaLiteWidget spec={spec} />
}

export default class PairsField extends ReactInlineField {
    static KEY = "ds_field_pairs_plot"
    EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new PairsField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <PairsWidget />
    }
}
