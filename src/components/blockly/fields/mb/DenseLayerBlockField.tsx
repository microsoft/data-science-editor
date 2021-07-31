import React, { ReactNode, useContext, useEffect, useState } from "react"
import {
    Grid,
    Box,
    TextField,
    Tooltip,
    MenuItem,
    Select,
} from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { useId } from "react-use-id-hook"

export interface DenseLayerFieldValue {
    parametersVisible: boolean
    numTrainableParams: number
    runTimeInCycles: number
    outputShape: number[]
    numUnits: number
    activation: string
}

function LayerParameterWidget(props: {
    initFieldValue: DenseLayerFieldValue
    setFieldValue: (f: DenseLayerFieldValue) => void
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
    const [numUnits, setNumUnits] = useState(initFieldValue.numUnits)
    const [activation, setActivation] = useState(initFieldValue.activation)

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [numUnits, activation])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numTrainableParams: numTrainableParams, // don't actually change this
            runTimeInCycles: runTimeInCycles, // don't actually change this
            outputShape: outputShape, // don't actually change this
            numUnits: numUnits,
            activation: activation,
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
        ) as ReactParameterField<DenseLayerFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateModelParameters = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<DenseLayerFieldValue>
        console.log("Randi update block parameters: ", parameterField)

        // calculate the size of this layer (based on size of previous layer as well as parameters here)
        // update the number of trainable parameters (based on the size of this layer)
        // update the number of cycles it will take to run (based on the size of this layer)
    }

    const handleChangedUnits = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for vaules less than 1
        if (newValue && !isNaN(newValue)) {
            setNumUnits(newValue)
        }
    }

    const handleChangedActivation = event => {
        const newValue = event.target.value
        if (newValue) setActivation(newValue)
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item>
                <Box color="text.secondary">
                    No. of filters
                    <Tooltip title="Update the number of units">
                        <TextField
                            id={useId() + "filters"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={numUnits}
                            onChange={handleChangedUnits}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Activation
                    <Tooltip title="Update the activation function">
                        <Select
                            id={useId() + "activation"}
                            variant="outlined"
                            value={activation}
                            onChange={handleChangedActivation}
                        >
                            <MenuItem value="linear">Linear</MenuItem>
                            <MenuItem value="sigmoid">Sigmoid</MenuItem>
                            <MenuItem value="relu">Relu</MenuItem>
                            <MenuItem value="tanh">Tanh</MenuItem>
                        </Select>
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

export default class DenseLayerBlockField extends ReactParameterField<DenseLayerFieldValue> {
    static KEY = "dense_layer_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new DenseLayerBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numTrainableParams: 0,
            runTimeInCycles: 0,
            outputShape: [0, 0],
            numUnits: 4,
            activation: "relu",
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

    updateFieldValue(msg: DenseLayerFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility or params set by model compile (will cause loop)
            numUnits: msg.numUnits,
            activation: msg.activation,
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
