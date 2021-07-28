import React, { lazy, useContext, useMemo, useState } from "react"
import WorkspaceContext from "../WorkspaceContext"
import useBlockData from "../useBlockData"
import { PointerBoundary } from "./PointerBoundary"
import Suspense from "../../ui/Suspense"
import { NoSsr } from "@material-ui/core"
import { CHART_HEIGHT, CHART_SVG_MAX_ITEMS, CHART_WIDTH } from "../toolbox"
import type { VisualizationSpec } from "react-vega"
import { DataSliceOptions } from "../../../workers/data/dist/node_modules/data.worker"
import useEffectAsync from "../../useEffectAsync"
import { tidySlice } from "./tidy"
const VegaLite = lazy(() => import("./VegaLite"))

export default function VegaLiteWidget(props: {
    spec: VisualizationSpec
    slice?: DataSliceOptions
}) {
    const { spec, slice } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    // eslint-disable-next-line @typescript-eslint/ban-types
    const [vegaData, setVegaData] = useState<{ values: object[] }>(undefined)

    useEffectAsync(
        async mounted => {
            if (!slice) {
                setVegaData({ values: data })
            } else {
                const sliced = await tidySlice(data, slice)
                if (mounted()) setVegaData({ values: sliced })
            }
        },
        [data]
    )

    if (!vegaData?.values?.length || !spec) return null

    const renderer =
        vegaData.values.length < CHART_SVG_MAX_ITEMS ? "svg" : "canvas"
    return (
        <NoSsr>
            <div style={{ background: "#fff", borderRadius: "0.25rem" }}>
                <PointerBoundary>
                    <Suspense>
                        <VegaLite
                            actions={false}
                            width={CHART_WIDTH}
                            height={CHART_HEIGHT}
                            spec={spec}
                            data={vegaData}
                            renderer={renderer}
                        />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}
