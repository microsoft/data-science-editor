import React, { ReactNode, useContext, useEffect, useState } from "react"
import { Grid, Box, TextField, Tooltip } from "@material-ui/core"

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { useId } from "react-use-id-hook"

export interface SmoothingBlockFieldValue {
    parametersVisible: boolean
    windowSize: number
    strideSize: number
}

function SmoothingParameterWidget(props: {
    initFieldValue: SmoothingBlockFieldValue
    setFieldValue: (f: SmoothingBlockFieldValue) => void
}) {
    const { initFieldValue, setFieldValue } = props

    const { workspaceJSON, sourceBlock } = useContext(WorkspaceContext)

    const [parametersVisible, setParametersVisible] = useState(
        initFieldValue.parametersVisible
    )
    const [windowSize, setWindowSize] = useState(initFieldValue.windowSize)
    const [strideSize, setStrideSize] = useState(initFieldValue.strideSize)

    useEffect(() => {
        // update based on source block's parameter visibility field
        updateVisibility()
    }, [workspaceJSON])

    const updateVisibility = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<SmoothingBlockFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const handleChangedWindow = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newWindowSize = event.target.valueAsNumber
        // Randi TODO give some sort of error message for numbers smaller than 2
        if (newWindowSize && !isNaN(newWindowSize)) {
            setWindowSize(newWindowSize)
        }
    }

    const handleChangedStride = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newStrideSize = event.target.valueAsNumber
        // Randi TODO give some sort of error message for numbers smaller than 1
        if (newStrideSize && !isNaN(newStrideSize)) {
            setStrideSize(newStrideSize)
        }
    }

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [windowSize, strideSize])

    const sendUpdate = () => {
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            windowSize: windowSize,
            strideSize: strideSize,
        }

        setFieldValue(updatedValue)
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1}>
            <Grid item>
                <Box color="text.secondary">
                    Window size
                    <Tooltip title="Update the window size, larger values lead to more smoothing">
                        <TextField
                            id={useId() + "windowSize"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={windowSize}
                            onChange={handleChangedWindow}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Stride size
                    <Tooltip title="Update the stride size, larger values lead to less smoothing">
                        <TextField
                            id={useId() + "stride"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={strideSize}
                            onChange={handleChangedStride}
                        />
                    </Tooltip>
                </Box>
            </Grid>
        </Grid>
    )
}

export default class SmoothingBlockField extends ReactParameterField<SmoothingBlockFieldValue> {
    static KEY = "smoothing_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new SmoothingBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            windowSize: 3,
            strideSize: 3,
        }
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

    getText_() {
        return ``
    }

    updateFieldValue(msg: SmoothingBlockFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility (will cause loop)
            windowSize: msg.windowSize,
            strideSize: msg.strideSize,
        }
    }

    renderInlineField(): ReactNode {
        return (
            <SmoothingParameterWidget
                initFieldValue={this.value}
                setFieldValue={this.updateFieldValue}
            />
        )
    }
}
