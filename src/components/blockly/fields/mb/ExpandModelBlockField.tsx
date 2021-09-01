import React, { useContext, useState } from "react"

import { Grid } from "@material-ui/core"
import AddCircleIcon from "@material-ui/icons/AddCircleOutline"
import RemoveCircleIcon from "@material-ui/icons/RemoveCircleOutline"
import IconButtonWithTooltip from "../../../ui/IconButtonWithTooltip"

import { ReactFieldJSON } from "../ReactField"
import ReactInlineField from "../ReactInlineField"
import WorkspaceContext from "../../WorkspaceContext"

import { MODEL_BLOCKS } from "../../../model-editor/modelblockdsl"

import DenseLayerBlockField from "./DenseLayerBlockField"
import DataSetBlockField from "./DataSetBlockField"
import RecordingBlockField from "./RecordingBlockField"
import NeuralNetworkBlockField from "./NeuralNetworkBlockField"
import ConvLayerBlockField from "./ConvLayerBlockField"
import PoolingLayerBlockField from "./PoolingLayerBlockField"
import DropoutLayerBlockField from "./DropoutLayerBlockField"
import FlattenLayerBlockField from "./FlattenLayerBlockField"
import { Block } from "blockly"

const REMOVABLE_INPUT = "REMOVABLE_INPUT"
const LAYER_INPUT = "LAYER_INPUTS"

function ExpandIconWidget() {
    const { sourceBlock } = useContext(WorkspaceContext)

    const getCurrentValue = () => {
        const expandField = sourceBlock.getField("EXPAND_BUTTON")
        if (expandField.getValue()) {
            const value = JSON.parse(expandField.getValue())
            return value
        }
        return null
    }

    const updateCurrentValue = (paramName: string, paramValue: any) => {
        const expandField = sourceBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField

        expandField.updateFieldValue({ paramName: paramValue })
    }

    const appendParamInput = (block: Block) => {
        block
            .appendDummyInput(REMOVABLE_INPUT)
            .appendField(getBlockFieldType(block.type), "BLOCK_PARAMS")

        // TODO. This is a hack, no moving blocks that are open
        block.setMovable(false)

        // place the new input before the input statement field
        if (block.getInput(LAYER_INPUT))
            block.moveInputBefore(REMOVABLE_INPUT, LAYER_INPUT)
    }

    const getBlockFieldType = (blockType: string) => {
        const currentValue = getCurrentValue()
        switch (blockType) {
            case MODEL_BLOCKS + "dataset":
                return new DataSetBlockField("", currentValue)
            case MODEL_BLOCKS + "recording":
                return new RecordingBlockField("", currentValue)
            case MODEL_BLOCKS + "nn":
                return new NeuralNetworkBlockField("", currentValue)
            case MODEL_BLOCKS + "conv1d_layer":
                return new ConvLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "conv2d_layer":
                return new ConvLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "dense_layer":
                return new DenseLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "dropout_layer":
                return new DropoutLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "flatten_layer":
                return new FlattenLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "maxpool1d_layer":
                return new PoolingLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "maxpool2d_layer":
                return new PoolingLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "avgpool1d_layer":
                return new PoolingLayerBlockField("", currentValue)
            case MODEL_BLOCKS + "avgpool2d_layer":
                return new PoolingLayerBlockField("", currentValue)
            default:
                console.error("Got inappropriate input for expanding block")
                return null
        }
    }

    const [parametersVisible, setParametersVisible] = useState(() => {
        const fieldValue = getCurrentValue()
        if (fieldValue) {
            const paramsVisible = fieldValue["parametersVisible"]
            if (paramsVisible) appendParamInput(sourceBlock)
            return paramsVisible
        }
        return false
    })

    const handleExpandBlock = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactInlineField
        if (parameterField) {
            // save the parameters written to that block
            const paramValues = JSON.parse(parameterField.getValue())
            Object.keys(paramValues).forEach(key => {
                updateCurrentValue(key, paramValues[key])
            })

            // identify which input to remove and remove it
            parameterField.getParentInput().name = REMOVABLE_INPUT
            sourceBlock.removeInput(REMOVABLE_INPUT)
            // TODO this is a hack. Need to implement textToDom and domToText for these mutator blocks
            sourceBlock.setMovable(true)

            // update the value of the expand button field
            updateCurrentValue("parametersVisible", false)
            setParametersVisible(false)
        } else {
            // add a removable field with the appropriate field type
            appendParamInput(sourceBlock)

            // update the value of the expand button field
            updateCurrentValue("parametersVisible", true)
            setParametersVisible(true)
        }
    }

    return (
        <Grid container spacing={1}>
            <Grid item>
                <IconButtonWithTooltip
                    style={{ backgroundColor: "transparent" }}
                    onClick={handleExpandBlock}
                    title="Expand dataset block to see all dataset info"
                >
                    {parametersVisible ? (
                        <RemoveCircleIcon />
                    ) : (
                        <AddCircleIcon />
                    )}
                </IconButtonWithTooltip>
            </Grid>
        </Grid>
    )
}

export default class ExpandModelBlockField extends ReactInlineField {
    static KEY = "model_field_key"

    constructor(value: string) {
        super(value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
        }
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "inline-block"
        c.style.minWidth = "2rem"
        return c
    }

    static fromJson(options: ReactFieldJSON) {
        return new ExpandModelBlockField(options?.value)
    }

    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
        this.updateBlockName()
    }

    updateBlockName() {
        const sourceBlock = this.getSourceBlock()

        const nameField = sourceBlock.inputList[0].fieldRow[0]
        const name: string = nameField.getValue()
        const blockName = name.substr(0, name.indexOf("(") - 1)

        if (sourceBlock.type.indexOf("conv") > 0) {
            // display filters, kernel size, and stride size for convolutional blocks
            nameField.setValue(
                `${blockName} (${this.value.numFilters}, ${this.value.kernelSize}, ${this.value.strideSize})`
            )
        } else if (sourceBlock.type.indexOf("pool") > 0) {
            // display kernel size and stride for pooling blocks
            // update the name of the block
            nameField.setValue(
                `${blockName} (${this.value.poolSize}, ${this.value.strideSize})`
            )
        } else if (sourceBlock.type.indexOf("dense") > 0) {
            // display number of units and activation functions for dense blocks
            nameField.setValue(
                `${blockName} (${this.value.numUnits}, ${this.value.activation})`
            )
        } else if (sourceBlock.type.indexOf("drop") > 0) {
            // display the dropout rate for dropout layers
            nameField.setValue(`${blockName} (${this.value.rate})`)
        }
        // don't list parameters of other blocks
    }

    getText_() {
        return ","
    }

    renderInlineField() {
        return <ExpandIconWidget />
    }

    updateFieldValue(msg: any) {
        this.value = {
            ...this.value,
            ...msg,
        }
        this.updateBlockName()
    }
}
