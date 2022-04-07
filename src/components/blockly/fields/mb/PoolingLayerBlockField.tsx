import React, { ReactNode, useContext } from "react"
import { styled } from "@mui/material/styles"
import { Box, Grid, TextField, Tooltip } from "@mui/material"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import WorkspaceContext from "../../WorkspaceContext"

import { useId } from "react"
import ExpandModelBlockField from "./ExpandModelBlockField"

const PREFIX = "PoolingLayerBlockField"

const classes = {
    fieldContainer: `${PREFIX}-fieldContainer`,
    field: `${PREFIX}-field`,
}

const Root = styled("div")(({ theme }) => ({
    [`& .${classes.fieldContainer}`]: {
        lineHeight: "2.5rem",
        width: "15rem",
    },

    [`& .${classes.field}`]: {
        width: theme.spacing(10),
    },
}))

export interface PoolingLayerFieldValue {
    percentParams: number
    percentSize: number
    runTimeInMs: number
    outputShape: number[]
    poolSize: number
    strideSize: number
}

function LayerParameterWidget(props: {
    initFieldValue: PoolingLayerFieldValue
}) {
    const { initFieldValue } = props
    const { sourceBlock } = useContext(WorkspaceContext)

    const { percentSize, percentParams, outputShape, runTimeInMs } =
        initFieldValue
    let { poolSize, strideSize } = initFieldValue

    const updateParameters = () => {
        // push changes to field values to the parent
        const updatedValue = {
            poolSize: poolSize,
            strideSize: strideSize,
        }

        // send new value to the parameter holder
        const expandField = sourceBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField
        expandField.updateFieldValue(updatedValue)
    }

    const handleChangedPoolSize = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        if (newValue && !isNaN(newValue)) {
            poolSize = newValue
            updateParameters()
        }
    }

    const handleChangedStrides = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        if (newValue && !isNaN(newValue)) {
            strideSize = newValue
            updateParameters()
        }
    }

    return (
        <PointerBoundary>
            <Grid container spacing={1} direction={"column"}>
                <Grid item className={classes.fieldContainer}>
                    <Box color="text.secondary">
                        pool size&emsp;
                        <Tooltip title="Update the pool size">
                            <TextField
                                id={useId() + "poolSize"}
                                type="number"
                                size="small"
                                variant="outlined"
                                defaultValue={poolSize}
                                onChange={handleChangedPoolSize}
                                className={classes.field}
                            />
                        </Tooltip>
                    </Box>
                    <Box color="text.secondary">
                        stride&emsp;
                        <Tooltip title="Update the stride">
                            <TextField
                                id={useId() + "stride"}
                                type="number"
                                size="small"
                                variant="outlined"
                                defaultValue={strideSize}
                                onChange={handleChangedStrides}
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

export default class PoolingLayerBlockField extends ReactInlineField {
    static KEY = "pooling_layer_block_field_key"

    constructor(value: string, previousValue?: any) {
        super(value)
        if (previousValue)
            this.value = { ...this.defaultValue, ...previousValue }
    }

    static fromJson(options: ReactFieldJSON) {
        return new PoolingLayerBlockField(options?.value)
    }

    /* This default value is specified here and in modelblockdsl.ts */
    get defaultValue() {
        return {
            percentParams: 0,
            percentSize: 0,
            runTimeInMs: 0,
            outputShape: [0, 0],
            poolSize: 2,
            strideSize: 1,
        }
    }

    getText_() {
        return ``
    }

    renderInlineField(): ReactNode {
        return (
            <Root>
                <LayerParameterWidget
                    initFieldValue={this.value as PoolingLayerFieldValue}
                />
            </Root>
        )
    }
}
