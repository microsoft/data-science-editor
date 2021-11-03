import React, { ReactNode, useContext } from "react"
import { styled } from "@mui/material/styles"
import { Box, Grid, MenuItem, Select, TextField, Tooltip } from "@mui/material"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import WorkspaceContext from "../../WorkspaceContext"

import { useId } from "react-use-id-hook"
import ExpandModelBlockField from "./ExpandModelBlockField"

const PREFIX = "ConvLayerBlockField"

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

export interface ConvLayerFieldValue {
    percentParams: number
    percentSize: number
    runTimeInMs: number
    outputShape: number[]
    numFilters: number
    kernelSize: number
    strideSize: number
    activation: string
}

function LayerParameterWidget(props: { initFieldValue: ConvLayerFieldValue }) {
    const { initFieldValue } = props
    const { sourceBlock } = useContext(WorkspaceContext)

    const { percentSize, percentParams, outputShape, runTimeInMs } =
        initFieldValue
    let { numFilters, kernelSize, strideSize, activation } = initFieldValue

    const updateParameters = () => {
        // push changes to field values to the parent
        const updatedValue = {
            numFilters: numFilters,
            kernelSize: kernelSize,
            strideSize: strideSize,
            activation: activation,
        }

        // send new value to the parameter holder
        const expandField = sourceBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField
        expandField.updateFieldValue(updatedValue)
    }

    const handleChangedFilters = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        if (newValue && !isNaN(newValue)) {
            numFilters = newValue
            updateParameters()
        }
    }

    const handleChangedKernelSize = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        if (newValue && !isNaN(newValue)) {
            kernelSize = newValue
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

    const handleChangedActivation = event => {
        const newValue = event.target.value
        if (newValue) {
            activation = newValue
            updateParameters()
        }
    }

    return (
        <Root>
            <PointerBoundary>
                <Grid container spacing={1} direction={"column"}>
                    <Grid item className={classes.fieldContainer}>
                        <Box color="text.secondary">
                            filters&emsp;
                            <Tooltip title="Update the kernel size">
                                <TextField
                                    id={useId() + "filters"}
                                    type="number"
                                    size="small"
                                    variant="outlined"
                                    defaultValue={numFilters}
                                    onChange={handleChangedFilters}
                                    className={classes.field}
                                />
                            </Tooltip>
                        </Box>
                        <Box color="text.secondary">
                            kernel size&emsp;
                            <Tooltip title="Update the kernel size">
                                <TextField
                                    id={useId() + "kernelSize"}
                                    type="number"
                                    size="small"
                                    variant="outlined"
                                    defaultValue={kernelSize}
                                    onChange={handleChangedKernelSize}
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
                        <Box color="text.secondary">
                            activation&emsp;
                            <Tooltip title="Update the activation function">
                                <Select
                                    id={useId() + "activation"}
                                    variant="outlined"
                                    defaultValue={activation}
                                    onChange={handleChangedActivation}
                                >
                                    <MenuItem value="softmax">softmax</MenuItem>
                                    <MenuItem value="linear">linear</MenuItem>
                                    <MenuItem value="relu">relu</MenuItem>
                                </Select>
                            </Tooltip>
                        </Box>
                    </Grid>
                    <Grid item>
                        <Box color="text.secondary">
                            Output shape: [{outputShape.join(", ")}]<br />
                            Percent of total size: {percentSize.toPrecision(2)}%
                            <br />
                            Percent of total params:{" "}
                            {percentParams.toPrecision(2)}%
                            <br />
                            Run time: {runTimeInMs.toPrecision(2)} ms <br />
                        </Box>
                    </Grid>
                </Grid>
            </PointerBoundary>
        </Root>
    )
}

export default class ConvLayerBlockField extends ReactInlineField {
    static KEY = "conv_layer_block_field_key"

    constructor(value: string, previousValue?: any) {
        super(value)
        if (previousValue)
            this.value = { ...this.defaultValue, ...previousValue }
    }

    static fromJson(options: ReactFieldJSON) {
        return new ConvLayerBlockField(options?.value)
    }

    /* This default value is specified here and in modelblockdsl.ts */
    get defaultValue() {
        return {
            percentParams: 0,
            percentSize: 0,
            runTimeInMs: 0,
            outputShape: [0, 0],
            numFilters: 16,
            kernelSize: 2,
            strideSize: 1,
        }
    }

    getText_() {
        return ``
    }

    renderInlineField(): ReactNode {
        return (
            <LayerParameterWidget
                initFieldValue={this.value as ConvLayerFieldValue}
            />
        )
    }
}
