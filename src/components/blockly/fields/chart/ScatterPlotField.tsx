import React, { useContext } from "react"
import WorkspaceContext from "../../WorkspaceContext"
import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import useBlockData from "../../useBlockData"
import VegaLiteWidget from "./VegaLiteWidget"
import { tidyResolveHeader } from "../tidy"
import { SCATTER_MAX_ITEMS } from "../../toolbox"
import { humanify } from "../../../dom/utils"
import { resolveColumns } from "../DataColumnChooserField"

function ScatterPlotWidget(props: {
    linearRegression?: boolean
    ysLength?: number
}) {
    const { linearRegression, ysLength = 1 } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data, transformedData } = useBlockData(sourceBlock)
    const x = tidyResolveHeader(data, sourceBlock?.getFieldValue("x"), "number")
    const ys = resolveColumns(data, sourceBlock, ysLength, {
        prefix: "y",
        dataType: "number",
    })

    const size = tidyResolveHeader(
        data,
        sourceBlock?.getFieldValue("size"),
        "number"
    )

    if (!x || !ys?.length) return null

    const sliceOptions = {
        sliceSample: SCATTER_MAX_ITEMS,
    }

    const y = ys.length > 1 ? { repeat: "repeat" } : ys[0]

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
                type: "quantitative",
                scale: { zero: false },
            },
        },
    }
    if (ys.length === 1) spec.encoding.y.title = humanify(ys[0])

    if (size)
        spec.encoding.size = {
            field: size,
            type: "quantitative",
            scale: { zero: false },
        }

    if (ys.length > 1) {
        spec = {
            repeat: ys,
            spec,
        }
    } else if (linearRegression) {
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

    console.log({ spec, ysLength })

    return <VegaLiteWidget spec={spec} slice={sliceOptions} />
}

export interface ScatterPlotFieldProps {
    linearRegression?: boolean
    ysLength?: number
}

export default class ScatterPlotField extends ReactInlineField {
    static KEY = "ds_field_scatter_plot"
    EDITABLE = false
    linearRegression: boolean
    ysLength: number

    static fromJson(options: ReactFieldJSON) {
        return new ScatterPlotField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: ScatterPlotFieldProps) {
        super(options)
        this.linearRegression = !!options?.linearRegression
        this.ysLength = options?.ysLength ?? 1
    }

    renderInlineField() {
        return (
            <ScatterPlotWidget
                linearRegression={this.linearRegression}
                ysLength={this.ysLength}
            />
        )
    }
}
