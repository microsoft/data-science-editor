import React, { ReactNode, useContext, useEffect, useState } from "react"
import {
    Box,
    Grid,
    MenuItem,
    Select,
    TextField,
    Tooltip,
    makeStyles,
    Theme,
    createStyles,
} from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import { PointerBoundary } from "../PointerBoundary"

import WorkspaceContext, { resolveBlockServices } from "../../WorkspaceContext"

import { useId } from "react-use-id-hook"
import ExpandModelBlockField from "./ExpandModelBlockField"

export interface NeuralNetworkBlockFieldValue {
    totalLayers: number
    totalParams: number
    totalSize: number
    runTimeInMs: number
    inputShape: number[]
    optimizer: string
    numEpochs: number
    lossFn: string
    metrics: string
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

function NNParameterWidget(props: {
    initFieldValue: NeuralNetworkBlockFieldValue
}) {
    const { initFieldValue } = props
    const { sourceBlock } = useContext(WorkspaceContext)
    const classes = useStyles()

    const { totalLayers, totalSize, totalParams, runTimeInMs, inputShape } =
        initFieldValue
    const [optimizer, setOptimizer] = useState<string>(initFieldValue.optimizer)
    const [numEpochs, setNumEpochs] = useState(initFieldValue.numEpochs)
    const [lossFn, setLossFn] = useState(initFieldValue.lossFn)
    const [metrics, setMetrics] = useState(initFieldValue.metrics)

    useEffect(() => {
        // push changes to source block after state values update
        updateParameters()
    }, [optimizer, numEpochs, lossFn, metrics])

    const updateParameters = () => {
        // push changes to field values to the parent
        const updatedValue = {
            optimizer: optimizer,
            numEpochs: numEpochs,
            lossFn: lossFn,
            metrics: metrics,
        }

        // send new value to the parameter holder
        const expandField = sourceBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField
        expandField.updateFieldValue(updatedValue)
    }

    const handleChangedEpochs = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        if (newValue && !isNaN(newValue)) {
            setNumEpochs(newValue)
        }
    }

    const handleChangedOptimizer = event => {
        const newValue = event.target.value
        if (newValue) setOptimizer(newValue)
    }

    const handleChangedLossFn = event => {
        const newValue = event.target.value
        if (newValue) setLossFn(newValue)
    }

    return (
        <PointerBoundary>
            <Grid container spacing={1} direction={"column"}>
                <Grid item className={classes.fieldContainer}>
                    <Box color="text.secondary">
                        optimizer&ensp;
                        <Tooltip title="Update the optimizer">
                            <Select
                                id={useId() + "optimizer"}
                                variant="outlined"
                                value={optimizer}
                                onChange={handleChangedOptimizer}
                            >
                                <MenuItem value="adam">adam</MenuItem>
                                <MenuItem value="sgd">SGD</MenuItem>
                                <MenuItem value="adagrad">adagrad</MenuItem>
                                <MenuItem value="adadelta">adadelta</MenuItem>
                            </Select>
                        </Tooltip>
                    </Box>
                    <Box color="text.secondary">
                        loss&ensp;
                        <Tooltip title="Update the loss function">
                            <Select
                                id={useId() + "lossFn"}
                                variant="outlined"
                                value={lossFn}
                                onChange={handleChangedLossFn}
                            >
                                <MenuItem value="categoricalCrossentropy">
                                    CCE
                                </MenuItem>
                                <MenuItem value="meanSquaredError">
                                    MSE
                                </MenuItem>
                                <MenuItem value="hinge">hinge</MenuItem>
                            </Select>
                        </Tooltip>
                    </Box>
                    <Box color="text.secondary">
                        epochs&ensp;
                        <Tooltip title="Update the batch size to train on">
                            <TextField
                                id={useId() + "epochs"}
                                type="number"
                                size="small"
                                variant="outlined"
                                value={numEpochs}
                                onChange={handleChangedEpochs}
                                className={classes.field}
                            />
                        </Tooltip>
                    </Box>
                </Grid>
                <Grid item>
                    <Box color="text.secondary">
                        Input shape: [{inputShape.join(", ")}]<br />
                        No. of layers: {totalLayers} <br />
                        No. of parameters: {totalParams} <br />
                        Total size: {(totalSize / 1000).toPrecision(2)} KB{" "}
                        <br />
                        Run time: {runTimeInMs.toPrecision(2)}ms @ 64MHz <br />
                    </Box>
                </Grid>
            </Grid>
        </PointerBoundary>
    )
}

export default class NeuralNetworkBlockField extends ReactInlineField {
    static KEY = "nn_block_field_key"

    constructor(value: string, previousValue?: any) {
        super(value)
        if (previousValue)
            this.value = { ...this.defaultValue, ...previousValue }
    }

    static fromJson(options: ReactFieldJSON) {
        return new NeuralNetworkBlockField(options?.value)
    }

    /* This default value is specified here and in modelblockdsl.ts */
    get defaultValue() {
        return {
            totalLayers: 0,
            totalParams: 0,
            totalSize: 0,
            runTimeInMs: 0,
            inputShape: [0, 0],
            optimizer: "adam",
            numEpochs: 200,
            lossFn: "categoricalCrossentropy",
            metrics: "acc",
        }
    }

    getText_() {
        const { totalLayers } = this.value

        return `${totalLayers} layer(s)`
    }

    renderInlineField(): ReactNode {
        return <NNParameterWidget initFieldValue={this.value} />
    }
}
