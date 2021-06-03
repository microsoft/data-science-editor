import React, { useContext, useEffect, useState } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Grid, Switch, Typography } from "@material-ui/core"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import { PointerBoundary } from "./PointerBoundary"
import { WatchValueType } from "../../../../jacdac-ts/src/vm/vmrunner"
import { VM_WATCH_CHANGE } from "../../../../jacdac-ts/src/vm/utils"
import { roundWithPrecision } from "../../../../jacdac-ts/src/jdom/utils"

function WatchValueWidget() {
    const { runner, sourceId } = useContext(WorkspaceContext)

    // track changes
    const [value, setValue] = useState<WatchValueType>(
        runner?.lookupWatch(sourceId)
    )
    useEffect(
        () =>
            runner?.subscribe(VM_WATCH_CHANGE, watchSourceId => {
                if (watchSourceId === sourceId) {
                    const newValue = runner.lookupWatch(sourceId)
                    setValue(newValue)
                }
            }),
        [runner, sourceId]
    )

    console.log("watch", { sourceId, value })
    // nothing to show here
    if (value === undefined)
        return <Typography variant="caption">...</Typography>

    let valueNumber = typeof value === "number" ? (value as number) : undefined
    if (!isNaN(valueNumber)) {
        const step = Math.ceil(Math.abs(valueNumber)) / 10
        const precision = step < 1 ? Math.ceil(-Math.log10(step)) : 0
        valueNumber = roundWithPrecision(valueNumber, precision)
    }

    return (
        <Grid
            container
            alignItems="flex-start"
            alignContent="center"
            spacing={1}
        >
            <Grid item>
                <PointerBoundary>
                    {!isNaN(valueNumber) ? (
                        <Typography variant="body1">{valueNumber}</Typography>
                    ) : typeof value === "boolean" ? (
                        <Switch value={!!value} />
                    ) : (
                        <Typography variant="body1">{value}</Typography>
                    )}
                </PointerBoundary>
            </Grid>
        </Grid>
    )
}

export default class WatchValueField extends ReactInlineField {
    static KEY = "jacdac_watch_value"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new WatchValueField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    renderInlineField() {
        return <WatchValueWidget />
    }
}
