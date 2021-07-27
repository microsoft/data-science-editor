import React, { lazy, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import useBlockData from "../useBlockData"
import { PointerBoundary } from "./PointerBoundary"
import Suspense from "../../ui/Suspense"
import { NoSsr } from "@material-ui/core"
import { CHART_HEIGHT, CHART_WIDTH } from "../toolbox"
const VegaLite = lazy(() => import("./VegaLite"))

function HistogramWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const hasData = !!data?.length
    // need to map data to vega-lite
    const index = sourceBlock?.getFieldValue("index")

    if (!hasData || !index) return null

    console.log("histogram", { index, data })

    const histogram_spec: any = {
        description: `Histogram of ${index}`,
        mark: { type: "bar", tooltip: true },
        encoding: {
            x: { bin: true, field: index },
            y: { aggregate: "count" },
        },
        data: { name: "values" },
    }

    const histogram_data = {
        values: data,
    }

    return (
        <NoSsr>
            <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                <PointerBoundary>
                    <Suspense>
                        <VegaLite
                            actions={false}
                            width={CHART_WIDTH}
                            height={CHART_HEIGHT}
                            spec={histogram_spec}
                            data={histogram_data}
                        />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}

export default class HistogramField extends ReactInlineField {
    static KEY = "jacdac_field_histogram"
    static EDITABLE = false

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
