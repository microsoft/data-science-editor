import React, { useContext, useEffect, useMemo, useState } from "react"
import { Grid, NoSsr } from "@mui/material"
import FileTabs from "../fs/FileTabs"

import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockEditor from "../blockly/BlockEditor"
import Blockly from "blockly"
import modelBlockDsl, { MODEL_BLOCKS } from "./modelblockdsl"
import shadowDsl from "../blockly/dsl/shadowdsl"
import fieldsDsl from "../blockly/dsl/fieldsdsl"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import { visitWorkspace } from "../blockly/dsl/workspacevisitor"

import { BlockJSON, WorkspaceFile } from "../blockly/dsl/workspacejson"
import { WORKSPACE_FILENAME } from "../blockly/toolbox"
import useFileSystem, { FileSystemProvider } from "../FileSystemContext"
import ServiceManagerContext from "../ServiceManagerContext"
import { resolveBlockServices } from "../blockly/WorkspaceContext"

import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import Suspense from "../ui/Suspense"
import { visitToolbox, MB_WARNINGS_CATEGORY } from "../blockly/toolbox"
import FieldDataSet from "../FieldDataSet"
import ModelBlockDialogs, {
    addNewDataSet,
} from "../dialogs/mb/ModelBlockDialogs"
import MBModel, { MCU_FLOAT_SIZE, MCU_SPEED, validModelJSON } from "./MBModel"
import MBDataSet, { validDataSetJSON } from "./MBDataSet"
import { prepareModel, prepareDataSet } from "./TrainModel"
import ExpandModelBlockField from "../blockly/fields/mb/ExpandModelBlockField"

const MB_EDITOR_ID = "mb"
const MB_SOURCE_STORAGE_KEY = "model-block-blockly-xml"
const MB_DATA_STORAGE_KEY = "model-block-data-json"
const MB_NEW_FILE_CONTENT = JSON.stringify({
    editor: MB_EDITOR_ID,
    xml: "",
} as WorkspaceFile)

function getRecordingsFromLocalStorage() {
    // check local storage for blocks
    const dataObj = localStorage.getItem(MB_DATA_STORAGE_KEY)
    if (dataObj == null || dataObj == undefined) return {}
    const modelEditorData = JSON.parse(dataObj)

    // add recordings from local storage
    const rBlocks = {}
    for (const id in modelEditorData["recordings"]) {
        const recordings = modelEditorData["recordings"][id]
        rBlocks[id] = recordings.map(recording => {
            return FieldDataSet.createFromFile(recording)
        })
    }
    return rBlocks
}
function getTrainedModelsFromLocalStorage() {
    // check local storage for blocks
    const dataObj = localStorage.getItem(MB_DATA_STORAGE_KEY)
    if (dataObj == null || dataObj == undefined) return {}
    const modelEditorData = JSON.parse(dataObj)

    // add recordings from local storage
    const mBlocks = {}
    for (const id in modelEditorData["models"]) {
        const model = modelEditorData["models"][id]
        mBlocks[id] = MBModel.createFromFile(model)
    }
    return mBlocks
}

function getEmptyMap() {
    return {}
}

function ModelBlockEditorWithContext(props: {
    allRecordings: Record<string, FieldDataSet[]>
    trainedModels: Record<string, MBModel>
}) {
    // block context handles hosting blockly
    const { workspace, workspaceJSON, toolboxConfiguration } =
        useContext(BlockContext)

    const { fileSystem } = useFileSystem()
    const { fileStorage } = useContext(ServiceManagerContext)

    /* For data storage */
    const { allRecordings, trainedModels } = props
    const [currentDataSet, setCurrentDataSet] = useState(undefined)
    const [currentModel, setCurrentModel] = useState(undefined)
    // dictionary of model vars and MBModel objs
    const allModels = useMemo(getEmptyMap, [])
    const allDataSets = useMemo(getEmptyMap, [])
    const updateLocalStorage = (newRecordings, newTrainedModels) => {
        const recordings = newRecordings || allRecordings
        const models = newTrainedModels || trainedModels

        // convert dataset object to JSON string
        const modelBlocksDataJSON = JSON.stringify({
            recordings: recordings,
            models: models,
        })
        // save JSON string in local storage
        localStorage.setItem(MB_DATA_STORAGE_KEY, modelBlocksDataJSON)
    }

    /* For workspace changes */
    const modelBlocks = {}
    const dataSetBlocks = {}
    const updateDataSetBlocks = (block: BlockJSON) => {
        const dataSetName =
            block.inputs[0].fields["dataset_name"].value?.toString()
        if (dataSetName) {
            if (dataSetName in dataSetBlocks) {
                setWarning(
                    workspace,
                    block.id,
                    "Two dataset blocks cannot have the same name"
                )
                setWarning(
                    workspace,
                    dataSetBlocks[dataSetName].id,
                    "Two dataset blocks cannot have the same name"
                )
                delete dataSetBlocks[dataSetName]
            } else dataSetBlocks[dataSetName] = block
        }
    }
    const updateModelBlocks = (block: BlockJSON) => {
        const modelName =
            block.inputs[0].fields["classifier_name"].value?.toString()
        if (modelName) {
            if (modelName in modelBlocks) {
                setWarning(
                    workspace,
                    block.id,
                    "Two classifier blocks cannot have the same name"
                )
                setWarning(
                    workspace,
                    modelBlocks[modelName].id,
                    "Two model blocks cannot have the same name"
                )
                delete modelBlocks[modelName]
            } else modelBlocks[modelName] = block
        }
    }
    // clear warnings, collect datasets and models
    useEffect(() => {
        visitWorkspace(workspaceJSON, {
            visitBlock: block => {
                // clear warnings on block
                setWarning(workspace, block.id, undefined)

                // collect dataset blocks
                if (block.type == MODEL_BLOCKS + "dataset") {
                    updateDataSetBlocks(block)
                }

                // collect model blocks
                if (block.type == MODEL_BLOCKS + "nn") {
                    updateModelBlocks(block)
                }
            },
        })
    }, [workspace, workspaceJSON, modelBlocks, dataSetBlocks])

    const assembleDataSet = (dataSetName: string) => {
        // associate block with dataset
        const dataSet: MBDataSet = new MBDataSet(dataSetName)
        const dataSetBlock = dataSetBlocks[dataSetName]

        // grab nested recording blocks and place them in the dataset
        const recordingBlock = dataSetBlock?.inputs.filter(
            input => input.name == "LAYER_INPUTS"
        )[0].child
        if (recordingBlock) {
            let className = recordingBlock?.inputs[0].fields?.class_name?.value
            allRecordings[recordingBlock.id].forEach(recording => {
                dataSet.addRecording(recording, className, null)
            })
            recordingBlock.children?.forEach(childBlock => {
                className = childBlock?.inputs[0].fields?.class_name?.value
                allRecordings[childBlock.id].forEach(recording => {
                    dataSet.addRecording(recording, className, null)
                })
            })
        }

        // store dataset in memory
        allDataSets[dataSetName] = dataSet

        return dataSet
    }
    const assembleModel = (modelName: string) => {
        // associate block with model
        const model: MBModel = allModels[modelName] || new MBModel(modelName)
        const modelBlock = modelBlocks[modelName]

        // if this model already existed from before
        if (model.blockJSON) {
            // make sure its contents line up with what's saved
            // if not, mark the model as uncompiled / empty
            if (JSON.stringify(modelBlock) != JSON.stringify(model.blockJSON)) {
                model.parseBlockJSON = modelBlock
                model.status = "empty"
            }
        } else model.parseBlockJSON = modelBlock

        // store model in memory
        allModels[modelName] = model

        return model
    }
    const addParametersToDataSetBlock = (dataSet: MBDataSet) => {
        const dataSetName = dataSet.name
        const inputTypes = dataSet.inputTypes

        const dataSetBlock = workspace.getBlockById(
            dataSetBlocks[dataSetName].id
        )

        // update the parameters of the dataset
        const paramField = dataSetBlock.getField(
            "EXPAND_BUTTON"
        ) as ExpandModelBlockField
        paramField.updateFieldValue({
            numSamples: dataSet.totalRecordings,
            inputClasses: dataSet.labels,
            inputTypes: inputTypes,
            shape: [dataSet.length, dataSet.width],
        })
    }
    const addParametersToModelBlock = (model: MBModel) => {
        const modelName = model.name
        const totalStats = model.modelStats.total
        const layerStats = model.modelStats.layers

        // update field parameters for each block in model
        const modelBlock = workspace.getBlockById(modelBlocks[modelName].id)

        if (modelBlock) {
            const paramField = modelBlock.getField(
                "EXPAND_BUTTON"
            ) as ExpandModelBlockField

            const totalModelSize = totalStats.codeBytes + totalStats.weightBytes
            const totalModelParams = totalStats.weightBytes / MCU_FLOAT_SIZE
            paramField.updateFieldValue({
                totalLayers: layerStats.length,
                inputShape: totalStats.inputShape,
                runTimeInMs: totalStats.optimizedCycles / MCU_SPEED,
                totalSize: totalModelSize,
                totalParams: totalModelParams,
            })

            // go through layers
            model.layerJSON.forEach((layer, idx) => {
                const layerBlock = workspace.getBlockById(layer.id)

                if (layerBlock) {
                    const layerParamField = layerBlock.getField(
                        "EXPAND_BUTTON"
                    ) as ExpandModelBlockField

                    const totalLayerSize =
                        layerStats[idx].codeBytes + layerStats[idx].weightBytes
                    const totalLayerParams =
                        layerStats[idx].weightBytes / MCU_FLOAT_SIZE
                    layerParamField.updateFieldValue({
                        outputShape: layerStats[idx].outputShape,
                        percentSize: (totalLayerSize * 100) / totalModelSize,
                        percentParams:
                            (totalLayerParams * 100) / totalModelParams,
                        runTimeInMs:
                            layerStats[idx].optimizedCycles / MCU_SPEED,
                    })
                }
            })
        } else
            console.error("Could not locate block ", {
                modelName: modelName,
                id: modelBlocks[modelName].id,
            })
    }

    useEffect(() => {
        // compile datasets and set warnings if necessary
        for (const dataSetName in dataSetBlocks) {
            const dataSet: MBDataSet = assembleDataSet(dataSetName)

            const dataSetWarnings = validDataSetJSON(dataSetBlocks[dataSetName])
            if (dataSetWarnings) {
                if (Object.keys(dataSetWarnings).length) {
                    Object.keys(dataSetWarnings).forEach(blockId => {
                        setWarning(workspace, blockId, dataSetWarnings[blockId])
                    })
                } else {
                    prepareDataSet(dataSet)
                    addParametersToDataSetBlock(dataSet)
                }
            }
        }

        // compile all models and set warnings if necessary
        for (const modelName in modelBlocks) {
            // grab the MBModel associated with a model name
            const model: MBModel = assembleModel(modelName)

            // grab the dataset that will be used to train the mbmodel
            const dataSetName =
                modelBlocks[modelName].inputs[1].fields[
                    "nn_training"
                ].value?.toString()
            const trainingDataSet = allDataSets[dataSetName]

            // make sure the dataset does not have warnings on it
            const dataSetWarnings = validDataSetJSON(dataSetBlocks[dataSetName])
            if (dataSetWarnings && !Object.keys(dataSetWarnings).length) {
                // make sure the model (defined by the workspaceJSON) is valid
                const modelWarnings = validModelJSON(model.blockJSON)

                // if there are warnings, assign warnings to each block in the model
                if (modelWarnings) {
                    if (Object.keys(modelWarnings).length) {
                        Object.keys(modelWarnings).forEach(blockId => {
                            setWarning(
                                workspace,
                                blockId,
                                modelWarnings[blockId]
                            )
                        })
                    } else {
                        // there are no warnings, compile the model
                        prepareModel(
                            model,
                            trainingDataSet,
                            addParametersToModelBlock
                        )
                    }
                }
            }
        }
    }, [workspace, workspaceJSON])

    /* block services (warnings and data) */
    const setWarning = (workspace, blockId: string, warningText: string) => {
        const block = workspace.getBlockById(blockId)
        const blockServices = resolveBlockServices(block)
        if (blockServices)
            blockServices.setWarning(MB_WARNINGS_CATEGORY, warningText)
    }
    const setData = (workspace, blockId: string, dataArray: any[]) => {
        const block = workspace.getBlockById(blockId)
        const blockServices = resolveBlockServices(block)
        if (blockServices) blockServices.data = dataArray
    }

    /* For dialog handling */
    const [visibleDialog, setVisibleDialog] = useState<
        | "dataset"
        | "recording"
        | "model"
        | "trained_model"
        | "classifier"
        | "none"
    >("none")
    const toggleViewDataSetDialog = () => toggleDialog("dataset")
    const toggleRecordDataDialog = () => toggleDialog("recording")
    const toggleTrainModelDialog = () => toggleDialog("model")
    const toggleTestModelDialog = () => toggleDialog("trained_model")
    const toggleNewClassifierDialog = () => toggleDialog("classifier")
    const toggleDialog = dialog => {
        if (dialog != "none") setVisibleDialog(dialog)
        else setVisibleDialog("none")
    }
    const closeModals = () => {
        // reset dataset and model that gets passed to dialogs
        setCurrentDataSet(undefined)
        setCurrentModel(undefined)

        // close dialog
        toggleDialog("none")
    }
    const buttonsWithDialogs = {
        createNewDataSetButton: addNewDataSet,
        createNewRecordingButton: toggleRecordDataDialog,
        createNewClassifierButton: toggleNewClassifierDialog,
    }
    const openDataSetModal = (clickedBlock: Blockly.Block) => {
        const dataSetName = clickedBlock.getField("DATASET_NAME").getText()
        const selectedDataset = allDataSets[dataSetName]

        const dataSetWarnings = validDataSetJSON(dataSetBlocks[dataSetName])
        if (!dataSetWarnings || Object.keys(dataSetWarnings).length) {
            Blockly.alert(
                "This dataset cannot be opened. Address the warnings on the dataset definition block."
            )
        } else {
            setCurrentDataSet(selectedDataset)

            // open the view dataset modal
            toggleViewDataSetDialog()
        }
    }

    const closeRecordingModal = (
        recording: FieldDataSet[],
        blockId: string
    ) => {
        // save the new recording
        if (recording && blockId) {
            // Add recording data to list of recordings
            allRecordings[blockId] = recording

            updateLocalStorage(allRecordings, null)

            // keep this info so this block can be duplicated
            const newBlock = workspace.getBlockById(blockId)
            const expandField = newBlock.getField(
                "EXPAND_BUTTON"
            ) as ExpandModelBlockField
            expandField.updateFieldValue({ originalBlock: blockId })
        }

        // close dialog
        closeModals()
    }

    const openTrainingModal = (clickedBlock: Blockly.Block) => {
        // setup model for training
        const modelName = clickedBlock.getField("CLASSIFIER_NAME").getText()
        const selectedModel: MBModel = allModels[modelName]

        // setup dataset for training
        const dataSetName = clickedBlock.getField("NN_TRAINING").getText()
        const selectedDataset = allDataSets[dataSetName]

        const dataSetWarnings = validDataSetJSON(dataSetBlocks[dataSetName])
        if (!dataSetWarnings || Object.keys(dataSetWarnings).length) {
            Blockly.alert(
                "This model cannot be trained. Address the warnings on the dataset definition block."
            )
        } else {
            const modelWarnings = validModelJSON(modelBlocks[modelName])
            if (!modelWarnings || Object.keys(modelWarnings).length) {
                Blockly.alert(
                    "This model cannot be trained. Address the warnings on model architecture block."
                )
            } else {
                // update the model and dataset to pass to the modal
                setCurrentModel(selectedModel)
                setCurrentDataSet(selectedDataset)

                // open the training modal
                toggleTrainModelDialog()
            }
        }
    }
    const updateModel = (model: MBModel, blockId: string) => {
        // Add trained model to record of allModels
        if (model) allModels[model.name] = model

        // Model was trained, add model to list of trained models
        if (blockId) {
            const trainedModel = MBModel.createFromFile(model.toJSON())
            trainedModels[blockId] = trainedModel

            // add dataset and model to new block
            const newBlock = workspace.getBlockById(blockId)
            const services = resolveBlockServices(newBlock)
            services.data = [currentDataSet, trainedModel]

            // keep this info so this block can be duplicated
            const expandField = newBlock.getField(
                "TRAINED_MODEL_DISPLAY"
            ) as ExpandModelBlockField
            expandField.updateFieldValue({ originalBlock: blockId })

            updateLocalStorage(null, trainedModels)
        }
    }

    const openTestingModal = (clickedBlock: Blockly.Block) => {
        // setup model for training
        const selectedModel: MBModel = trainedModels[clickedBlock.id]

        if (selectedModel) {
            // update the model and dataset to pass to the modal
            setCurrentModel(selectedModel)

            // open the training modal
            toggleTestModelDialog()
        }
    }

    /* For button callbacks */
    useEffect(() => {
        // register callbacks buttons with custom dialogs
        visitToolbox(toolboxConfiguration, {
            visitButton: btn => {
                if (btn.callbackKey in buttonsWithDialogs) {
                    btn.callback = workspace => {
                        buttonsWithDialogs[btn.callbackKey](workspace)
                    }
                }
            },
        })
    }, [toolboxConfiguration])

    /* For block button clicks */
    const resolveRecordingBlockInfo = (recordingBlock: Blockly.Block) => {
        // get recording
        let recording: FieldDataSet[] = allRecordings[recordingBlock.id]
        if (!recording) {
            // this block must be a duplicate, get the original block id
            const originalBlockId = JSON.parse(
                recordingBlock.getFieldValue("EXPAND_BUTTON")
            )["originalBlock"]
            recording = allRecordings[originalBlockId]

            // add duplicate block to list of trained models
            allRecordings[recordingBlock.id] = recording
            updateLocalStorage(allRecordings, null)

            const expandField = recordingBlock.getField(
                "EXPAND_BUTTON"
            ) as ExpandModelBlockField
            expandField.updateFieldValue({
                originalBlock: recordingBlock.id,
            })
        }
        // add recording data to block
        setData(workspace, recordingBlock.id, recording)
    }
    const resolveTrainedModelBlockInfo = (trainedModelBlock: Blockly.Block) => {
        // get model
        let model: MBModel = trainedModels[trainedModelBlock.id]
        if (!model) {
            // this block must be a duplicate, get the original block id
            const originalBlockId = JSON.parse(
                trainedModelBlock.getFieldValue("TRAINED_MODEL_DISPLAY")
            )["originalBlock"]
            model = trainedModels[originalBlockId]

            // add duplicate block to list of trained models
            trainedModels[trainedModelBlock.id] = model
            updateLocalStorage(null, trainedModels)

            const expandField = trainedModelBlock.getField(
                "TRAINED_MODEL_DISPLAY"
            ) as ExpandModelBlockField
            expandField.updateFieldValue({
                originalBlock: trainedModelBlock.id,
            })
        }

        // get dataset
        const dataSetName = trainedModelBlock
            .getField("MODEL_TEST_SET")
            .getText()
        let dataset = allDataSets[dataSetName]

        if (dataset) {
            const dataSetWarnings = validDataSetJSON(dataSetBlocks[dataSetName])
            if (!dataSetWarnings || Object.keys(dataSetWarnings).length) {
                setWarning(
                    workspace,
                    trainedModelBlock.id,
                    "This dataset cannot be tested. Address the warnings on the dataset definition block."
                )
                dataset = undefined
            }
        }

        if (dataset && model)
            setData(workspace, trainedModelBlock.id, [
                dataset,
                model,
                fileStorage,
            ])
    }
    const handleWorkspaceChange = event => {
        if (event.type == Blockly.Events.BLOCK_DELETE) {
            event.ids.forEach(blockId => {
                delete allRecordings[blockId]
                delete trainedModels[blockId]
            })
            updateLocalStorage(allRecordings, trainedModels)
        } else if (event.type == Blockly.Events.BLOCK_CREATE && event.ids) {
            // add info to newly created recording and trained model blocks
            event.ids.forEach(blockId => {
                const createdBlock = workspace.getBlockById(blockId)
                if (createdBlock.type == "model_block_trained_nn")
                    resolveTrainedModelBlockInfo(createdBlock)
                else if (createdBlock.type == "model_block_recording")
                    resolveRecordingBlockInfo(createdBlock)
            })
        } else if (event.type == Blockly.Events.CLICK && event.blockId) {
            const clickedBlock = workspace.getBlockById(event.blockId)
            if (clickedBlock.data && clickedBlock.data.startsWith("click")) {
                const command = clickedBlock.data.split(".")[1]
                if (command == "download") {
                    const recording = allRecordings[clickedBlock.id]
                    // find the correct recording, dataset, or model to download
                    if (recording) {
                        // get recording, recording name, and class name
                        const className = clickedBlock
                            .getField("CLASS_NAME")
                            .getText()
                        downloadRecordings(recording, className)
                    } else {
                        // we have a model or dataset
                        if (clickedBlock.type == MODEL_BLOCKS + "dataset") {
                            const dataSetName = clickedBlock
                                .getField("DATASET_NAME")
                                .getText()
                            const dataSet = allDataSets[dataSetName]
                            downloadFile(dataSet.toCSV(), dataSetName, "csv")
                        } else if (clickedBlock.type == MODEL_BLOCKS + "nn") {
                            const modelName = clickedBlock
                                .getField("CLASSIFIER_NAME")
                                .getText()
                            const model: MBModel = allModels[modelName]
                            downloadFile(
                                JSON.stringify(model),
                                modelName,
                                "json"
                            )
                        } else if (
                            clickedBlock.type ==
                            MODEL_BLOCKS + "trained_nn"
                        ) {
                            const model: MBModel =
                                trainedModels[clickedBlock.id]
                            downloadFile(
                                JSON.stringify(model),
                                model.name,
                                "json"
                            )
                        }
                    }
                } else if (command == "edit") {
                    openDataSetModal(clickedBlock)
                } else if (command == "train") {
                    openTrainingModal(clickedBlock)
                } else if (command == "view") {
                    openTestingModal(clickedBlock)
                }
                // clear the command
                clickedBlock.data = null
            }
        } else if (event.type == Blockly.Events.BLOCK_CHANGE && event.blockId) {
            // update trained model blocks on dropdown changes
            const changedBlock = workspace.getBlockById(event.blockId)
            if (changedBlock.data && changedBlock.data.startsWith("click")) {
                const command = changedBlock.data.split(".")[1]
                if (command == "refreshdisplay") {
                    resolveTrainedModelBlockInfo(changedBlock)
                }
                // clear the command
                changedBlock.data = null
            }
        }
    }
    const downloadRecordings = (
        recordings: FieldDataSet[],
        className: string
    ) => {
        const recordingCountHeader = `Number of recordings,${recordings.length}`

        const recordingData: string[] = []
        recordings.forEach(sample => {
            recordingData.push(
                "Recording metadata," +
                    sample.name +
                    "," +
                    sample.rows.length +
                    "," +
                    className
            )
            recordingData.push(sample.toCSV())
        })
        const recordData = recordingData.join("\n")

        const csv: string[] = [recordingCountHeader, recordData]
        downloadFile(csv.join("\n"), recordings[0].name, "csv")
    }
    const downloadFile = (
        content: string,
        fileName: string,
        fileType: string
    ) => {
        fileStorage.saveText(`${fileName}.${fileType}`, content)
    }
    useEffect(() => {
        if (workspace) workspace.addChangeListener(handleWorkspaceChange)

        return () => {
            if (workspace) workspace.removeChangeListener(handleWorkspaceChange)
        }
    }, [workspace, workspaceJSON])

    return (
        <Grid container direction="column" spacing={1}>
            {!!fileSystem && (
                <Grid item xs={12}>
                    <FileTabs
                        newFileName={WORKSPACE_FILENAME}
                        newFileContent={MB_NEW_FILE_CONTENT}
                        hideFiles={true}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <BlockEditor />
                {Flags.diagnostics && <BlockDiagnostics />}
                <Suspense>
                    <ModelBlockDialogs
                        visibleDialog={visibleDialog}
                        onRecordingDone={closeRecordingModal}
                        onModelUpdate={updateModel}
                        closeModal={closeModals}
                        workspace={workspace}
                        dataset={currentDataSet}
                        model={currentModel}
                        recordingCount={Object.keys(allRecordings).length}
                        trainedModelCount={Object.keys(trainedModels).length}
                    />
                </Suspense>
            </Grid>
            {Flags.diagnostics && <BlockDiagnostics />}
        </Grid>
    )
}

export default function ModelBlockEditor() {
    const dsls = useMemo(() => {
        return [modelBlockDsl, shadowDsl, fieldsDsl]
    }, [])

    const recordings = getRecordingsFromLocalStorage()
    const models = getTrainedModelsFromLocalStorage()

    return (
        <NoSsr>
            <FileSystemProvider>
                <BlockProvider
                    editorId={MB_EDITOR_ID}
                    storageKey={MB_SOURCE_STORAGE_KEY}
                    dsls={dsls}
                >
                    <ModelBlockEditorWithContext
                        allRecordings={recordings}
                        trainedModels={models}
                    />
                </BlockProvider>
            </FileSystemProvider>
        </NoSsr>
    )
}
