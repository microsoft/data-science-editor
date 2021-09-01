import React, { ReactNode, useContext, useEffect, useState } from "react"
import {
    Box,
    Grid,
    TextField,
    Tooltip,
    makeStyles,
    Theme,
    createStyles,
} from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import WorkspaceContext from "../../WorkspaceContext"

import { useId } from "react-use-id-hook"
import ExpandModelBlockField from "./ExpandModelBlockField"

export interface DropoutLayerFieldValue {
    percentParams: number
    percentSize: number
    runTimeInMs: number
    outputShape: number[]
    rate: string
}

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        fieldContainer: {
            lineHeight: "2.5rem",
            width: "15rem",
        },
        field: {
            width: theme.spacing(10),
        },
    })
)

function LayerParameterWidget(props: {
    initFieldValue: DropoutLayerFieldValue
}) {
    const { initFieldValue } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const classes = useStyles()

    const { percentSize, percentParams, outputShape, runTimeInMs } =
        initFieldValue
    let rate = initFieldValue.rate

    const updateParameters = () => {
        let rateAsNum
        if (rate == "0.") rateAsNum = 0
        else rateAsNum = parseFloat(rate)
        // push changes to field values to the parent
        const updatedValue = {
            rate: rateAsNum,
        }

        // send new value to the parameter holder
        const expandField = sourceBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField
        expandField.updateFieldValue(updatedValue)
    }

    const handleChangedRate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.value
        if (newValue) {
            let valueAsNum

            // catch edge case?
            if (newValue == "0.") valueAsNum = 0
            else valueAsNum = parseFloat(newValue)

            if (valueAsNum >= 0 && valueAsNum < 1) {
                rate = newValue
                updateParameters()
            }
        }
    }

    return (
        <PointerBoundary>
            <Grid container spacing={1} direction={"column"}>
                <Grid item className={classes.fieldContainer}>
                    <Box color="text.secondary">
                        rate&emsp;
                        <Tooltip title="Update the dropout rate">
                            <TextField
                                id={useId() + "rate"}
                                type="text"
                                size="small"
                                variant="outlined"
                                defaultValue={rate}
                                onChange={handleChangedRate}
                                className={classes.field}
                            />
                        </Tooltip>
                    </Box>
                </Grid>
                <Grid item>
                    <Box color="text.secondary">
                        Output shape: [{outputShape.join(", ")}]<br />
                        Percent of total size: {percentSize.toPrecision(2)}%
                        <br />
                        Percent of total params: {percentParams.toPrecision(2)}%
                        <br />
                        Run time: {runTimeInMs.toPrecision(2)} ms <br />
                    </Box>
                </Grid>
            </Grid>
        </PointerBoundary>
    )
}

export default class DropoutLayerBlockField extends ReactInlineField {
    static KEY = "dropout_layer_block_field_key"

    constructor(value: string, previousValue?: any) {
        super(value)
        if (previousValue)
            this.value = { ...this.defaultValue, ...previousValue }
    }

    static fromJson(options: ReactFieldJSON) {
        return new DropoutLayerBlockField(options?.value)
    }

    /* This default value is specified here and in modelblockdsl.ts */
    get defaultValue() {
        return {
            percentParams: 0,
            percentSize: 0,
            runTimeInMs: 0,
            outputShape: [0, 0],
            rate: "0.1",
        }
    }

    getText_() {
        return ``
    }

    renderInlineField(): ReactNode {
        return <LayerParameterWidget initFieldValue={this.value} />
    }
}
