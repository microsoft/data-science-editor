import React, { ReactNode, useContext, useEffect, useState } from "react"
import { Grid, Box, TextField, Tooltip, Checkbox } from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { useId } from "react-use-id-hook"

export interface PoolingLayerFieldValue {
    parametersVisible: boolean
    numTrainableParams: number
    runTimeInCycles: number
    outputShape: number[]
    poolSize: number
    strideSize: number
    padding: boolean
}

function LayerParameterWidget(props: {
    initFieldValue: PoolingLayerFieldValue
    setFieldValue: (f: PoolingLayerFieldValue) => void
}) {
    const { initFieldValue, setFieldValue } = props

    const { workspaceJSON, sourceBlock } = useContext(WorkspaceContext)

    const [parametersVisible, setParametersVisible] = useState(
        initFieldValue.parametersVisible
    )
    const [numTrainableParams, setnumTrainableParams] = useState(
        initFieldValue.numTrainableParams
    )
    const [runTimeInCycles, setrunTimeInCycles] = useState(
        initFieldValue.runTimeInCycles
    )
    const [outputShape, setOutputShape] = useState<number[]>(
        initFieldValue.outputShape
    )
    const [poolSize, setPoolSize] = useState(initFieldValue.poolSize)
    const [strideSize, setStrideSize] = useState(initFieldValue.strideSize)
    const [padding, setPadding] = useState(initFieldValue.padding)

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [poolSize, strideSize, padding])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numTrainableParams: numTrainableParams, // don't actually change this
            runTimeInCycles: runTimeInCycles, // don't actually change this
            outputShape: outputShape, // don't actually change this
            poolSize: poolSize,
            strideSize: strideSize,
            padding: padding,
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
        ) as ReactParameterField<PoolingLayerFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateModelParameters = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<PoolingLayerFieldValue>
        console.log("Randi update block parameters: ", parameterField)

        // calculate the size of this layer (based on size of previous layer as well as parameters here)
        // update the number of trainable parameters (based on the size of this layer)
        // update the number of cycles it will take to run (based on the size of this layer)
    }

    const handleChangedPoolSize = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for vaules less than 2
        if (newValue && !isNaN(newValue)) {
            setPoolSize(newValue)
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

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item>
                <Box color="text.secondary">
                    Pool size
                    <Tooltip title="Update the pool size">
                        <TextField
                            id={useId() + "poolSize"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={poolSize}
                            onChange={handleChangedPoolSize}
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

export default class PoolingLayerBlockField extends ReactParameterField<PoolingLayerFieldValue> {
    static KEY = "pooling_layer_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new PoolingLayerBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numTrainableParams: 0,
            runTimeInCycles: 0,
            outputShape: [0, 0],
            poolSize: 2,
            strideSize: 1,
            padding: false,
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

    updateFieldValue(msg: PoolingLayerFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility or params set by model compile (will cause loop)
            poolSize: msg.poolSize,
            strideSize: msg.strideSize,
            padding: msg.padding,
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
