import React, { ReactNode, useContext, useEffect, useState } from "react"
import { Grid, Box, Button, Tooltip } from "@material-ui/core"
import CallSplitIcon from "@material-ui/icons/CallSplit"
import DownloadIcon from "@material-ui/icons/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import { RecordingBlockFieldValue } from "./RecordingBlockField"
import WorkspaceContext from "../../WorkspaceContext"
import { FieldVariable } from "blockly"

export interface DataSetBlockFieldValue {
    parametersVisible: boolean
    numRecordings: number
    numSamples: number
    classes: string[]
    inputs: string[]
}

function DataSetParameterWidget(props: {
    initFieldValue: DataSetBlockFieldValue
    setFieldValue: (DataSetBlockFieldValue) => void
}) {
    const { initFieldValue, setFieldValue } = props

    const { workspaceJSON, sourceBlock } = useContext(WorkspaceContext)

    const [parametersVisible, setParametersVisible] = useState(
        initFieldValue.parametersVisible
    )
    const [numRecordings, setNumRecordings] = useState(
        initFieldValue.numRecordings
    )
    const [numSamples, setNumSamples] = useState(initFieldValue.numSamples)
    const [classes, setClasses] = useState<string[]>(initFieldValue.classes)
    const [inputs, setInputs] = useState<string[]>(initFieldValue.inputs)

    const handleSplitDataSet = () => {
        console.log("Split dataset")
    }
    const handleDownloadDataSet = () => {
        console.log("Download dataset")
    }

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [numRecordings, numSamples, classes, inputs])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numRecordings: numRecordings,
            numSamples: numSamples,
            classes: classes,
            inputs: inputs,
        }
        setFieldValue(updatedValue)
    }

    useEffect(() => {
        // update based on source block's parameter visibility field
        updateVisibility()

        // update based on source block's associated recording blocks
        updateRecordings()
    }, [workspaceJSON])

    const updateVisibility = () => {
        const datasetParameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<DataSetBlockFieldValue>
        setParametersVisible(datasetParameterField.areParametersVisible())
    }

    function arraysEqual(a: any[], b: any[]) {
        if (!a || !b) return false
        if (a.length !== b.length) return false
        if (a === b) return true

        for (let i = 0; i < a.length; ++i) {
            if (a[i] !== b[i]) return false
        }
        return true
    }

    const updateRecordings = () => {
        // update the recordings

        // gather all the layers
        let numRecordings = 0
        let numSamples = 0
        const updatedClasses = []
        let updatedInputs = []

        let layerBlock = sourceBlock.getInputTargetBlock("DATASET_RECORDINGS")
        while (layerBlock) {
            // get the block parameters for the recording
            const recordingParameterField = layerBlock.getField(
                "BLOCK_PARAMS"
            ) as ReactParameterField<RecordingBlockFieldValue>
            numSamples += recordingParameterField.value.numSamples

            // make sure that all recording blocks have the same input types
            const recordingBlockInputs =
                recordingParameterField.value.inputTypes
            if (!updatedInputs.length) updatedInputs = recordingBlockInputs
            if (!arraysEqual(updatedInputs, recordingBlockInputs)) {
                // Randi TODO attach warning to this block; gotta do this in ModelBlockEditor
                console.error(
                    "Error, recording block inputs do not match dataset",
                    { block: recordingBlockInputs, dataset: updatedInputs }
                )
            }

            // get the class name parameter and add it to the list of classes
            const classNameField = layerBlock.getField(
                "CLASS_NAME"
            ) as FieldVariable
            const className = classNameField.getVariable().name
            if (!updatedClasses.includes(className))
                updatedClasses.push(className)

            numRecordings += 1
            layerBlock = layerBlock.getNextBlock()
        }

        setNumRecordings(numRecordings)
        setNumSamples(numSamples)
        setClasses(updatedClasses)
        setInputs(updatedInputs)
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item style={{ display: "inline-flex" }}>
                <Box color="text.secondary">
                    Classes: {classes.length ? classes.join(", ") : "none"}{" "}
                    <br />
                    Input type(s): {inputs.length ? inputs.join(", ") : "none"}
                </Box>
            </Grid>
            <Grid item style={{ display: "inline-flex" }}>
                <Tooltip title="Automatically split dataset e.g. to create a test dataset">
                    <Button
                        onClick={handleSplitDataSet}
                        startIcon={<CallSplitIcon />}
                        variant="outlined"
                        size="small"
                    >
                        Split
                    </Button>
                </Tooltip>
                <Tooltip title="Download dataset as csv file">
                    <Button
                        onClick={handleDownloadDataSet}
                        startIcon={<DownloadIcon />}
                        variant="outlined"
                        size="small"
                    >
                        Download
                    </Button>
                </Tooltip>
            </Grid>
        </Grid>
    )
}

export default class DataSetBlockField extends ReactParameterField<DataSetBlockFieldValue> {
    static KEY = "dataset_block_field_key"
    static EDITABLE = false

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new DataSetBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numRecordings: 0,
            numSamples: 0,
            classes: [],
            inputs: [],
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
        const totalRecordings = this.value.numRecordings

        return `${totalRecordings} recording(s)`
    }

    updateFieldValue(msg: DataSetBlockFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility (will cause loop)
            numRecordings: msg.numRecordings,
            numSamples: msg.numSamples,
            classes: msg.classes,
            inputs: msg.inputs,
        }
    }

    renderInlineField(): ReactNode {
        return (
            <DataSetParameterWidget
                initFieldValue={this.value}
                setFieldValue={this.updateFieldValue}
            />
        )
    }
}
