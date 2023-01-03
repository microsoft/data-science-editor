import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { SCATTER_MAX_ITEMS } from "../../toolbox"
import { humanify } from "jacdac-ts"

function ScatterPlotWidget(props: { linearRegression?: boolean }) {
    const { linearRegression } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData(sourceBlock)
    const x = tidyResolveHeader(data, sourceBlock?.getFieldValue("x"), "number")
    const y = tidyResolveHeader(data, sourceBlock?.getFieldValue("y"), "number")
    const size = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("size"),
        "number"
    )

    if (!x || !y) return null

    const sliceOptions = {
        sliceSample: SCATTER_MAX_ITEMS,
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let spec: any = {
        mark: { type: "point", filled: true, tooltip: true },
        encoding: {
            x: {
                field: x,
                type: "quantitative",
                scale: { zero: false },
                title: humanify(x),
            },
            y: {
                field: y,
                title: humanify(y),
                type: "quantitative",
                scale: { zero: false },
            },
        },
    }
    if (size)
        spec.encoding.size = {
            field: size,
            type: "quantitative",
            scale: { zero: false },
        }

    if (linearRegression) {
        const { slope, intercept } = (transformedData?.[0] || {}) as any
        spec = {
            title:
                slope !== undefined
                    ? `slope: ${slope}, intercept: ${intercept}`
                    : undefined,
            layer: [
                spec,
                {
                    mark: {
                        type: "line",
                        color: "firebrick",
                    },
                    transform: [
                        {
                            regression: y,
                            on: x,
                        },
                    ],
                    encoding: {
                        x: {
                            field: x,
                            type: "quantitative",
                        },
                        y: {
                            field: y,
                            type: "quantitative",
                        },
                    },
                },
            ],
        }
    }
    spec.data = { name: "values" }

    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export interface ScatterPlotFieldProps {
    linearRegression?: boolean
}

export default class ScatterPlotField extends ReactInlineField {
    static KEY = "jacdac_field_scatter_plot"
    EDITABLE = false
    linearRegression: boolean

    static fromJson(options: ReactFieldJSON) {
        return new ScatterPlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: ScatterPlotFieldProps) {
        super(options)
        this.linearRegression = !!options?.linearRegression
    }

    renderInlineField() {
        return <ScatterPlotWidget linearRegression={this.linearRegression} />
    }
}
