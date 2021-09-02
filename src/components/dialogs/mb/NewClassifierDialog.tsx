import React, { useState } from "react"

import {
    Button,
    Grid,
    Dialog,
    DialogActions,
    DialogContent,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@material-ui/core"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import NavigateNextIcon from "@material-ui/icons/NavigateNext"

import Blockly, { Variables, WorkspaceSvg } from "blockly"
import { MB_CLASSIFIER_VAR_TYPE } from "../../model-editor/modelblockdsl"

const FIVE_CNN_1D = "5-cnn1d"
const TEN_CNN_1D = "10-cnn1d"
const FIVE_CNN_2D = "5-cnn2d"
const TEN_CNN_2D = "10-cnn2d"
const FC_ANN = "fc-ann"
const EMPTY = "empty"

export default function NewClassifierDialog(props: {
    classes: any
    open: boolean
    onDone: () => void
    workspace: WorkspaceSvg
}) {
    const { classes, open, onDone, workspace } = props

    const [classifierName, setClassifierName] = useState("")
    const [classifierType, setClassifierType] = useState("5-cnn2d")

    const addNewClassifierBlock = () => {
        const newClassifierName = classifierName || "classifier1"
        // check if name is already used
        if (classifierType) {
            if (!Variables.nameUsedWithAnyType(newClassifierName, workspace)) {
                // get or create new classifier typed variable
                workspace.createVariable(
                    newClassifierName,
                    MB_CLASSIFIER_VAR_TYPE
                )
            }

            // create new block with new classifier name
            if (classifierType == FIVE_CNN_1D) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field><statement name="LAYER_INPUTS"><block type="model_block_conv1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":4,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":4,"activation":"softmax"}</field></block></next></block></next></block></next></block></next></block></statement></block>`
                    ),
                    workspace
                )
            } else if (classifierType == FIVE_CNN_2D) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field><statement name="LAYER_INPUTS"><block type="model_block_conv2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":4,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":4,"activation":"softmax"}</field></block></next></block></next></block></next></block></next></block></statement></block>`
                    ),
                    workspace
                )
            } else if (classifierType == TEN_CNN_1D) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field><statement name="LAYER_INPUTS"><block type="model_block_conv1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":4,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_conv1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_conv1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":4,"activation":"softmax"}</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block>`
                    ),
                    workspace
                )
            } else if (classifierType == TEN_CNN_2D) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field><statement name="LAYER_INPUTS"><block type="model_block_conv2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":4,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_conv2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_maxpool2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"poolSize":2,"strideSize":1}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_conv2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field><next><block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"rate":0.1}</field><next><block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":4,"activation":"softmax"}</field></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></next></block></statement></block>`
                    ),
                    workspace
                )
            } else if (classifierType == FC_ANN) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field><statement name="LAYER_INPUTS"><block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":16,"activation":"relu"}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":16,"activation":"relu"}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":16,"activation":"relu"}</field><next><block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"numUnits":4,"activation":"softmax"}</field></block></next></block></next></block></next></block></next></block></statement></block>`
                    ),
                    workspace
                )
            } else if (classifierType == EMPTY) {
                Blockly.Xml.domToBlock(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newClassifierName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field></block>`
                    ),
                    workspace
                )
            }
        }
    }

    /* For interface controls */
    const handleClassifierNameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setClassifierName(event.target.value.trim())
    }

    const handleClassifierTypeChange = (
        event: React.ChangeEvent<{ value: unknown }>
    ) => {
        setClassifierType(event.target.value as string)
    }

    const handleCancel = () => {
        // call the done function
        onDone()
    }

    const handleDone = () => {
        // create and add the new block
        addNewClassifierBlock()

        // call the done function
        onDone()
    }

    return (
        <Dialog open={open} onClose={handleDone}>
            <DialogContent>
                <Grid container direction={"column"}>
                    <Grid item>
                        <h3>Create new classifier</h3>
                        <TextField
                            className={classes.field}
                            label="Classifier name"
                            defaultValue="classifier1"
                            variant="outlined"
                            onChange={handleClassifierNameChange}
                        />
                    </Grid>
                    <Grid item>
                        <InputLabel id="starter-label">
                            Base architecture{" "}
                        </InputLabel>
                        <Select
                            labelId="starter-label"
                            className={classes.field}
                            value={classifierType}
                            variant="outlined"
                            onChange={handleClassifierTypeChange}
                        >
                            <MenuItem value={FIVE_CNN_1D}>
                                5-Layer 1D CNN
                            </MenuItem>
                            <MenuItem value={FIVE_CNN_2D}>
                                5-Layer 2D CNN
                            </MenuItem>
                            <MenuItem value={TEN_CNN_1D}>
                                10-Layer 1D CNN
                            </MenuItem>
                            <MenuItem value={TEN_CNN_2D}>
                                10-Layer 2D CNN
                            </MenuItem>
                            <MenuItem value={FC_ANN}>
                                Fully Connected NN
                            </MenuItem>
                            <MenuItem value={EMPTY}>Empty</MenuItem>
                        </Select>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" onClick={handleCancel}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    endIcon={<NavigateNextIcon />}
                    onClick={handleDone}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    )
}
