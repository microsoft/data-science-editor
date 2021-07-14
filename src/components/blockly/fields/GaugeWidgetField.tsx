import React, { lazy, useContext } from "react"
import { ReactFieldJSON } from "./ReactField"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import useBlockData from "../useBlockData"
import Suspense from "../../ui/Suspense"
import { tidyFindLastValue } from "./nivo"
import { tidy, min as tidyMin, max as tidyMax, summarize } from "@tidyjs/tidy"
import { Grid } from "@material-ui/core"
import { roundWithPrecision } from "../../../../jacdac-ts/src/jdom/utils"
const GaugeWidget = lazy(() => import("../../widgets/GaugeWidget"))

function GaugeWidgetView() {
    const { sourceBlock } = useContext(WorkspaceContext)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = useBlockData<any>(sourceBlock)
    if (!data?.length) return null

    const field = sourceBlock?.getFieldValue("field") as string
    let value = tidyFindLastValue(data, field)
    if (value === undefined) return null

    let min = Number(sourceBlock?.getFieldValue("min"))
    let max = Number(sourceBlock?.getFieldValue("max"))
    if (min === max) {
        min = undefined
        max = undefined
    }

    if (isNaN(min)) min = tidy(data, summarize({ min: tidyMin(field) }))[0].min
    if (isNaN(max)) max = tidy(data, summarize({ max: tidyMax(field) }))[0].max

    // round with precision
    const step = Math.ceil(Math.abs(value)) / 10
    const precision = step < 1 ? Math.ceil(-Math.log10(step)) : 0
    value = roundWithPrecision(value, precision)

    // clamp values
    value = Math.min(max, Math.max(min, value))

    return (
        <Grid
            container
            justifyContent="center"
            alignContent="center"
            alignItems="center"
        >
            <Grid item>
                <Suspense>
                    <GaugeWidget value={value} min={min} max={max} />
                </Suspense>
            </Grid>
        </Grid>
    )
}

export default class GaugeWidgetField extends ReactInlineField {
    static KEY = "jacdac_field_gauge_widget"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new GaugeWidgetField(options)
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.width = "20rem"
        return c
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <GaugeWidgetView />
    }
}
