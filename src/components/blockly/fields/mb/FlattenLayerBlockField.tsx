import React, { ReactNode, useContext, useEffect, useState } from "react"
import { Grid, Box } from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"

export interface FlattenLayerFieldValue {
    parametersVisible: boolean
    numTrainableParams: number
    runTimeInCycles: number
    outputShape: number[]
}

function LayerParameterWidget(props: {
    initFieldValue: FlattenLayerFieldValue
}) {
    const { initFieldValue } = props

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

    useEffect(() => {
        // update based on source block's parameter visibility field
        updateVisibility()

        // update should happen after model is compiled
        updateModelParameters()
    }, [workspaceJSON])

    const updateVisibility = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<FlattenLayerFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateModelParameters = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<FlattenLayerFieldValue>
        console.log("Randi update block parameters: ", parameterField)

        // calculate the size of this layer (based on size of previous layer as well as parameters here)
        // update the number of trainable parameters (based on the size of this layer)
        // update the number of cycles it will take to run (based on the size of this layer)
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
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

export default class FlattenLayerBlockField extends ReactParameterField<FlattenLayerFieldValue> {
    static KEY = "flatten_layer_block_field_key"

    constructor(value: string) {
        super(value)
    }

    static fromJson(options: ReactFieldJSON) {
        return new FlattenLayerBlockField(options?.value)
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

    renderInlineField(): ReactNode {
        return <LayerParameterWidget initFieldValue={this.value} />
    }
}
