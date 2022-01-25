import React, { useContext, useEffect, useState } from "react"
import { ReactFieldJSON } from "./ReactField"
import { Box, Grid, Typography, useTheme } from "@mui/material"
import WorkspaceContext from "../WorkspaceContext"
import ReactInlineField from "./ReactInlineField"
import { PointerBoundary } from "./PointerBoundary"
import { VM_WATCH_CHANGE } from "../../../../jacdac-ts/src/vm/events"
import { roundWithPrecision } from "../../../../jacdac-ts/src/jdom/utils"
import useBlockData from "../useBlockData"
import JacdacContext, { JacdacContextProps } from "../../../jacdac/Context"
import SwitchWithLabel from "../../ui/SwitchWithLabel"

export type WatchValueType = boolean | string | number

const HORIZON = 10
function WatchValueWidget() {
    return <>TODO</>
    /*
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { sourceId, sourceBlock } = useContext(WorkspaceContext)
    const { data, setData } = useBlockData<{
        time: number
        value: number
    }>(sourceBlock, [])
    const theme = useTheme()

    // track changes
    const [value, setValue] = useState<WatchValueType>(
        runner?.lookupWatch(sourceId)
    )

    useEffect(
        () =>
            runner?.subscribe(VM_WATCH_CHANGE, (watchSourceId: string) => {
                if (watchSourceId === sourceId) {
                    const newValue = runner.lookupWatch(sourceId)
                    setValue(newValue)
                    if (!isNaN(newValue)) {
                        const newData = [
                            ...(data || []),
                            { time: bus.timestamp / 1000, value: newValue },
                        ].slice(-HORIZON)
                        setData(newData)
                    }
                }
            }),
        [runner, sourceId, data]
    )

    let valueNumber = typeof value === "number" ? (value as number) : undefined
    if (!isNaN(valueNumber)) {
        const step = Math.ceil(Math.abs(valueNumber)) / 10
        const precision = step < 1 ? Math.ceil(-Math.log10(step)) : 0
        valueNumber = roundWithPrecision(valueNumber, precision)
    }

    return (
        <Box
            bgcolor={theme.palette.background.paper}
            borderRadius="undefinedpx"
            color={theme.palette.text.primary}
        >
            <Grid
                container
                alignItems="flex-end"
                alignContent="center"
                justifyContent="center"
                spacing={1}
            >
                <Grid item>
                    <PointerBoundary>
                        {!isNaN(valueNumber) ? (
                            <Typography variant="body1">
                                {valueNumber}
                            </Typography>
                        ) : typeof value === "boolean" ? (
                            <Box pl={1}>
                                <SwitchWithLabel
                                    readOnly={true}
                                    checked={!!value}
                                    label={value ? "true" : "false"}
                                />
                            </Box>
                        ) : (
                            <Typography variant="body1">
                                {value === undefined ? "..." : value + ""}
                            </Typography>
                        )}
                    </PointerBoundary>
                </Grid>
            </Grid>
        </Box>
    )
    */
}

export default class WatchValueField extends ReactInlineField {
    static KEY = "jacdac_field_watch_value"
    EDITABLE = false

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
