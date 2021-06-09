import React, { useContext, useEffect, useState } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Box, Grid, Switch, Typography, useTheme } from "@material-ui/core"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import { PointerBoundary } from "./PointerBoundary"
import { WatchValueType } from "../../../../jacdac-ts/src/vm/runner"
import { VM_EVENT, VMCode } from "../../../../jacdac-ts/src/vm/events"
import { roundWithPrecision } from "../../../../jacdac-ts/src/jdom/utils"
import TrendChart, { useTrendChartData } from "../../TrendChart"

function WatchValueWidget() {
    const { runner, sourceId } = useContext(WorkspaceContext)
    const theme = useTheme()

    // track changes
    const [value, setValue] = useState<WatchValueType>(
        runner?.lookupWatch(sourceId)
    )
    const { trendData, addTrendValue } = useTrendChartData()

    useEffect(() => {
        setValue(undefined)
        return runner?.subscribe(
            VM_EVENT,
            (code: VMCode, watchSourceId?: string) => {
                if (code === VMCode.WatchChange && watchSourceId === sourceId) {
                    const newValue = runner.lookupWatch(sourceId)
                    setValue(newValue)
                    addTrendValue(newValue)
                }
            }
        )
    }, [runner, sourceId])

    let valueNumber = typeof value === "number" ? (value as number) : undefined
    if (!isNaN(valueNumber)) {
        const step = Math.ceil(Math.abs(valueNumber)) / 10
        const precision = step < 1 ? Math.ceil(-Math.log10(step)) : 0
        valueNumber = roundWithPrecision(valueNumber, precision)
    }

    return (
        <Box
            bgcolor={theme.palette.background.paper}
            borderRadius={theme.spacing(1)}
            color={theme.palette.text.primary}
        >
            <Grid
                container
                alignItems="flex-end"
                alignContent="center"
                justify="center"
                spacing={1}
            >
                <Grid item>
                    <PointerBoundary>
                        {!isNaN(valueNumber) ? (
                            <Typography variant="body1">
                                {valueNumber}
                            </Typography>
                        ) : typeof value === "boolean" ? (
                            <Switch value={!!value} />
                        ) : (
                            <Typography variant="body1">
                                {value === undefined ? "..." : value + ""}
                            </Typography>
                        )}
                    </PointerBoundary>
                </Grid>
                {!isNaN(valueNumber) && (
                    <Grid item>
                        <PointerBoundary>
                            <TrendChart
                                data={trendData}
                                mini={true}
                                dot={2}
                                useGradient={true}
                            />
                        </PointerBoundary>
                    </Grid>
                )}
            </Grid>
        </Box>
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

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "inline-block"
        c.style.minWidth = "4rem"
        return c
    }

    renderInlineField() {
        return <WatchValueWidget />
    }
}
