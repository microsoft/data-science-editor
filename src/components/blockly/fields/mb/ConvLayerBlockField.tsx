import React, { ReactNode, useContext, useEffect, useState } from "react"
import {
    Grid,
    Box,
    TextField,
    Tooltip,
    Checkbox,
    MenuItem,
    Select,
} from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { useId } from "react-use-id-hook"

export interface ConvLayerFieldValue {
    parametersVisible: boolean
    numTrainableParams: number
    runTimeInCycles: number
    outputShape: number[]
    numFilters: number
    kernelSize: number
    strideSize: number
    padding: boolean
    activation: string
}

function LayerParameterWidget(props: {
    initFieldValue: ConvLayerFieldValue
    setFieldValue: (f: ConvLayerFieldValue) => void
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
    const [numFilters, setNumFilters] = useState(initFieldValue.numFilters)
    const [kernelSize, setKernelSize] = useState(initFieldValue.kernelSize)
    const [strideSize, setStrideSize] = useState(initFieldValue.strideSize)
    const [padding, setPadding] = useState(initFieldValue.padding)
    const [activation, setActivation] = useState(initFieldValue.activation)

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [numFilters, kernelSize, strideSize, padding, activation])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numTrainableParams: numTrainableParams, // don't actually change this
            runTimeInCycles: runTimeInCycles, // don't actually change this
            outputShape: outputShape, // don't actually change this
            numFilters: numFilters,
            kernelSize: kernelSize,
            strideSize: strideSize,
            padding: padding,
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
        ) as ReactParameterField<ConvLayerFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateModelParameters = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<ConvLayerFieldValue>
        console.log("Randi update block parameters: ", parameterField)

        // calculate the size of this layer (based on size of previous layer as well as parameters here)
        // update the number of trainable parameters (based on the size of this layer)
        // update the number of cycles it will take to run (based on the size of this layer)
    }

    const handleChangedFilters = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for vaules less than 1
        if (newValue && !isNaN(newValue)) {
            setNumFilters(newValue)
        }
    }

    const handleChangedKernelSize = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for vaules less than 2
        if (newValue && !isNaN(newValue)) {
            setKernelSize(newValue)
        }
    }

    const handleChangedStrides = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for values less than 1
        if (newValue && !isNaN(newValue)) {
            setStrideSize(newValue)
        }
    }

    const handleChangedPadding = () => {
        setPadding(!padding)
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
                    <Tooltip title="Update the kernel size">
                        <TextField
                            id={useId() + "filters"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={numFilters}
                            onChange={handleChangedFilters}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Kernel size
                    <Tooltip title="Update the kernel size">
                        <TextField
                            id={useId() + "kernelSize"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={kernelSize}
                            onChange={handleChangedKernelSize}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Stride
                    <Tooltip title="Update the stride">
                        <TextField
                            id={useId() + "stride"}
                            size="small"
                            variant="outlined"
                            value={strideSize}
                            onChange={handleChangedStrides}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Padding
                    <Tooltip title="Update whether to use padding or not">
                        <Checkbox
                            checked={padding}
                            onChange={handleChangedPadding}
                            name="paddingCheckbox"
                            style={{ backgroundColor: "transparent" }}
                            color="default"
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

export default class ConvLayerBlockField extends ReactParameterField<ConvLayerFieldValue> {
    static KEY = "conv_layer_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new ConvLayerBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numTrainableParams: 0,
            runTimeInCycles: 0,
            outputShape: [0, 0],
            numFilters: 1,
            kernelSize: 1,
            strideSize: 1,
            padding: false,
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

    updateFieldValue(msg: ConvLayerFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility or params set by model compile (will cause loop)
            numFilters: msg.numFilters,
            kernelSize: msg.kernelSize,
            strideSize: msg.strideSize,
            padding: msg.padding,
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
