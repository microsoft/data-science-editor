import React, { ReactNode, useContext, useEffect, useState } from "react"
import { Grid, Box, TextField, Tooltip } from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { useId } from "react-use-id-hook"

export interface DropoutLayerFieldValue {
    parametersVisible: boolean
    numTrainableParams: number
    runTimeInCycles: number
    outputShape: number[]
    rate: number
}

function LayerParameterWidget(props: {
    initFieldValue: DropoutLayerFieldValue
    setFieldValue: (f: DropoutLayerFieldValue) => void
}) {
    const { initFieldValue, setFieldValue } = props

    const { workspaceJSON, sourceBlock } = useContext(WorkspaceContext)

    const [parametersVisible, setParametersVisible] = useState(
        initFieldValue.parametersVisible
    )
    const [numTrainableParams, setNumTrainableParams] = useState(
        initFieldValue.numTrainableParams
    )
    const [runTimeInCycles, setRunTimeInCycles] = useState(
        initFieldValue.runTimeInCycles
    )
    const [outputShape, setOutputShape] = useState<number[]>(
        initFieldValue.outputShape
    )
    const [rate, setRate] = useState(initFieldValue.rate)

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [rate])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numTrainableParams: numTrainableParams, // don't actually change this
            runTimeInCycles: runTimeInCycles, // don't actually change this
            outputShape: outputShape, // don't actually change this
            rate: rate,
        }
        setFieldValue(updatedValue)
    }

    useEffect(() => {
        // update based on source block's parameter visibility field
        updateVisibility()

        // update should happen after model is compiled
        updateModelParameters()
    }, [workspaceJSON])

    const updateVisibility = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<DropoutLayerFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateModelParameters = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<DropoutLayerFieldValue>
        console.log("Randi update block parameters: ", parameterField)

        // calculate the size of this layer (based on size of previous layer as well as parameters here)
        // update the number of trainable parameters (based on the size of this layer)
        // update the number of cycles it will take to run (based on the size of this layer)
    }

    const handleChangedRate = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for vaules less than 1
        if (newValue && !isNaN(newValue)) {
            setRate(newValue)
        }
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item>
                <Box color="text.secondary">
                    Rate
                    <Tooltip title="Update the dropout rate">
                        <TextField
                            id={useId() + "rate"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={rate}
                            onChange={handleChangedRate}
                        />
                    </Tooltip>
                </Box>
            </Grid>
            <Grid item>
                <Box color="text.secondary">
                    No. of Parameters: {numTrainableParams}
                </Box>
                <Box color="text.secondary">Cycles: {runTimeInCycles}</Box>
                <Box color="text.secondary">
                    Shape: [{outputShape.join(", ")}]
                </Box>
            </Grid>
        </Grid>
    )
}

export default class DropoutLayerBlockField extends ReactParameterField<DropoutLayerFieldValue> {
    static KEY = "dropout_layer_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new DropoutLayerBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numTrainableParams: 0,
            runTimeInCycles: 0,
            outputShape: [0, 0],
            rate: 0.1,
        }
    }

    getText_() {
        return ``
    }

    areParametersVisible() {
        const { parametersVisible } = this.value
        return parametersVisible
    }

    setParametersVisible(visible) {
        const updatedValue = {
            ...this.value,
            parametersVisible: visible,
        }
        this.value = updatedValue
    }

    updateFieldValue(msg: DropoutLayerFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility or params set by model compile (will cause loop)
            rate: msg.rate,
        }
    }

    renderInlineField(): ReactNode {
        return (
            <LayerParameterWidget
                initFieldValue={this.value}
                setFieldValue={this.updateFieldValue}
            />
        )
    }
}
