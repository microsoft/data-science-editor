import React, { ReactNode, useContext, useEffect, useState } from "react"
import {
    Grid,
    Box,
    Button,
    Tooltip,
    TextField,
    Select,
    MenuItem,
} from "@material-ui/core"
import AutorenewIcon from "@material-ui/icons/Autorenew"
//import DownloadIcon from "@material-ui/icons/GetApp"
// tslint:disable-next-line: no-submodule-imports match-default-export-name

import { ReactFieldJSON } from "../ReactField"
import ReactParameterField from "../ReactParameterField"
import WorkspaceContext from "../../WorkspaceContext"
import { FieldVariable } from "blockly"

import { openBlankDialog } from "../../../model-editor/ModelBlockModals"
import { useId } from "react-use-id-hook"

export interface NeuralNetworkBlockFieldValue {
    parametersVisible: boolean
    numLayers: number
    modelSize: number
    modelCycles: number
    classes: string[]
    learningRate: number
    optimizer: string
    batchSize: number
    numEpochs: number
    lossFn: string
    metrics: string
}

function NNParameterWidget(props: {
    initFieldValue: NeuralNetworkBlockFieldValue
    setFieldValue: (f: NeuralNetworkBlockFieldValue) => void
}) {
    const { initFieldValue, setFieldValue } = props

    const { workspaceJSON, sourceBlock } = useContext(WorkspaceContext)

    const [parametersVisible, setParametersVisible] = useState(
        initFieldValue.parametersVisible
    )
    const [numLayers, setNumLayers] = useState(initFieldValue.numLayers)
    const [modelSize, setModelSize] = useState(initFieldValue.modelSize)
    const [modelCycles, setModelCycles] = useState(initFieldValue.modelCycles)
    const [classes, setClasses] = useState<string[]>(initFieldValue.classes)
    const [learningRate, setLearningRate] = useState(
        initFieldValue.learningRate
    )
    const [optimizer, setOptimizer] = useState<string>(initFieldValue.optimizer)
    const [batchSize, setBatchSize] = useState(initFieldValue.batchSize)
    const [numEpochs, setNumEpochs] = useState(initFieldValue.numEpochs)
    const [lossFn, setLossFn] = useState(initFieldValue.lossFn)
    const [metrics, setMetrics] = useState(initFieldValue.metrics)

    useEffect(() => {
        // push changes to source block after state values update
        sendUpdate()
    }, [
        numLayers,
        modelSize,
        modelCycles,
        classes,
        learningRate,
        optimizer,
        batchSize,
        numEpochs,
        lossFn,
        metrics,
    ])

    const sendUpdate = () => {
        // push changes to field values to the parent
        const updatedValue = {
            parametersVisible: parametersVisible, // don't actually change this
            numLayers: numLayers,
            modelSize: modelSize,
            modelCycles: modelCycles,
            classes: classes,
            learningRate: learningRate,
            optimizer: optimizer,
            batchSize: batchSize,
            numEpochs: numEpochs,
            lossFn: lossFn,
            metrics: metrics,
        }
        setFieldValue(updatedValue)
    }

    useEffect(() => {
        // update based on source block's parameter visibility field
        updateVisibility()

        // update based on source block's associated training dataset and parameters
        updateParameters()
    }, [workspaceJSON])

    const updateVisibility = () => {
        const parameterField = sourceBlock.getField(
            "BLOCK_PARAMS"
        ) as ReactParameterField<NeuralNetworkBlockFieldValue>
        setParametersVisible(parameterField.areParametersVisible())
    }

    const updateParameters = () => {
        const trainingSetField = sourceBlock.getField(
            "NN_TRAINING"
        ) as FieldVariable
        console.log("Randi NN update parameters: ", trainingSetField)

        // gather all the layers
        let numLayers = 0
        let layerBlock = sourceBlock.getInputTargetBlock("NN_LAYERS")
        while (layerBlock) {
            //console.log("Randi NN next child", layerBlock.type)
            // get the block parameters for the layer

            numLayers += 1
            layerBlock = layerBlock.getNextBlock()
        }

        // calculate how quickly the model should run
        // calculate how large the model is

        // find the associated dataset and...
        //     copy the class labels parameter
        //     get the total numSamples

        setNumLayers(numLayers)
    }

    const handleChangedLearningRate = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for inappropriate values
        if (newValue && !isNaN(newValue)) {
            setLearningRate(newValue)
        }
    }

    const handleChangedEpochs = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for numbers smaller than 1
        if (newValue && !isNaN(newValue)) {
            setNumEpochs(newValue)
        }
    }

    const handleChangedBatchSize = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newValue = event.target.valueAsNumber
        // Randi TODO give some sort of error message for numbers larger than the number of samples
        if (newValue && !isNaN(newValue)) {
            setBatchSize(newValue)
        }
    }

    const handleChangedOptimizer = event => {
        const newValue = event.target.value
        // Randi TODO give some sort of error message for invalid optimizer choices
        if (newValue) setOptimizer(newValue)
    }

    const handleChangedLossFn = event => {
        const newValue = event.target.value
        // Randi TODO give some sort of error message for invalid loss fn choice
        if (newValue) setLossFn(newValue)
    }

    const handleChangedMetrics = event => {
        const newValue = event.target.value
        // Randi TODO give some sort of error message for invalid metric choice
        if (newValue) setMetrics(newValue)
    }

    const handleViewModel = () => {
        console.log("Open NN classifier modal")
        openBlankDialog()
    }

    if (!parametersVisible) return null
    return (
        <Grid container spacing={1} direction={"row"}>
            <Grid item style={{ display: "inline-flex", width: 300 }}>
                <Tooltip title="Open modal to view and run classifier">
                    <Button
                        onClick={handleViewModel}
                        startIcon={<AutorenewIcon />}
                        variant="outlined"
                        size="small"
                    >
                        Train Model
                    </Button>
                </Tooltip>
            </Grid>
            <Grid item>
                <Box color="text.secondary">
                    Learning rate
                    <Tooltip title="Update the learning rate">
                        <TextField
                            id={useId() + "windowSize"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={learningRate}
                            onChange={handleChangedLearningRate}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Optimizer
                    <Tooltip title="Update the optimizer">
                        <Select
                            id={useId() + "optimizer"}
                            variant="outlined"
                            value={optimizer}
                            onChange={handleChangedOptimizer}
                        >
                            <MenuItem value="adam">Adam</MenuItem>
                            <MenuItem value="sgd">SGD</MenuItem>
                            <MenuItem value="adagrad">Adagrad</MenuItem>
                            <MenuItem value="adadelta">Adadelta</MenuItem>
                        </Select>
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Batch size
                    <Tooltip title="Update the batch size to train on">
                        <TextField
                            id={useId() + "stride"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={batchSize}
                            onChange={handleChangedBatchSize}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Epochs
                    <Tooltip title="Update the batch size to train on">
                        <TextField
                            id={useId() + "epochs"}
                            type="number"
                            size="small"
                            variant="outlined"
                            value={numEpochs}
                            onChange={handleChangedEpochs}
                        />
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Loss Fn
                    <Tooltip title="Update the loss function">
                        <Select
                            id={useId() + "lossFn"}
                            variant="outlined"
                            value={lossFn}
                            onChange={handleChangedLossFn}
                        >
                            <MenuItem value="categoricalCrossentropy">
                                Categorical Crossentropy
                            </MenuItem>
                            <MenuItem value="meanSquaredError">
                                Mean Squared Error
                            </MenuItem>
                            <MenuItem value="hinge">Hinge Loss</MenuItem>
                        </Select>
                    </Tooltip>
                </Box>
                <Box color="text.secondary">
                    Metrics
                    <Tooltip title="Update the metrics">
                        <Select
                            id={useId() + "metrics"}
                            variant="outlined"
                            value={metrics}
                            onChange={handleChangedMetrics}
                        >
                            <MenuItem value="acc">Accuracy</MenuItem>
                            <MenuItem value="prec">Precision</MenuItem>
                            <MenuItem value="recall">Recall</MenuItem>
                        </Select>
                    </Tooltip>
                </Box>
            </Grid>
            <Grid item>
                <Box color="text.secondary">
                    No. of Layers: {numLayers} <br />
                    Classes: {classes.length ? classes.join(", ") : "none"}{" "}
                    <br />
                    Model size: {modelSize} <br />
                    Cycles: {modelCycles} <br />
                </Box>
            </Grid>
        </Grid>
    )
}

export default class NeuralNetworkBlockField extends ReactParameterField<NeuralNetworkBlockFieldValue> {
    static KEY = "nn_block_field_key"

    constructor(value: string) {
        super(value)
        this.updateFieldValue = this.updateFieldValue.bind(this)
    }

    static fromJson(options: ReactFieldJSON) {
        return new NeuralNetworkBlockField(options?.value)
    }

    get defaultValue() {
        return {
            parametersVisible: false,
            numLayers: 0,
            modelSize: 0,
            modelCycles: 0,
            classes: [],
            learningRate: 0.001,
            optimizer: "adam",
            batchSize: 32,
            numEpochs: 200,
            lossFn: "categoricalCrossentropy",
            metrics: "accuracy,",
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
        const { numLayers } = this.value

        return `${numLayers} layer(s)`
    }

    updateFieldValue(msg: NeuralNetworkBlockFieldValue) {
        this.value = {
            ...this.value, // don't copy over visibility (will cause loop)
            modelSize: msg.modelSize,
            numLayers: msg.numLayers,
            modelCycles: msg.modelCycles,
            classes: msg.classes,
            learningRate: msg.learningRate,
            optimizer: msg.optimizer,
            batchSize: msg.batchSize,
            numEpochs: msg.numEpochs,
        }
    }

    renderInlineField(): ReactNode {
        return (
            <NNParameterWidget
                initFieldValue={this.value}
                setFieldValue={this.updateFieldValue}
            />
        )
    }
}
