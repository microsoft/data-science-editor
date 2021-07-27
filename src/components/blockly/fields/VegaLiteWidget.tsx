import React, { lazy, useContext } from "react"
import WorkspaceContext from "../WorkspaceContext"
import useBlockData from "../useBlockData"
import { PointerBoundary } from "./PointerBoundary"
import Suspense from "../../ui/Suspense"
import { NoSsr } from "@material-ui/core"
import { CHART_HEIGHT, CHART_WIDTH } from "../toolbox"
import type { VisualizationSpec } from "react-vega"
const VegaLite = lazy(() => import("./VegaLite"))

export default function VegaLiteWidget(props: { spec: VisualizationSpec  }) {
    const { spec } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const { data } = useBlockData(sourceBlock)
    const hasData = !!data?.length

    if (!hasData || !spec) return null

    const vegaData = { values: data }

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
                            renderer="svg"
                        />
                    </Suspense>
                </PointerBoundary>
            </div>
        </NoSsr>
    )
}
