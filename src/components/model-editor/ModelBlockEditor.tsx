import React, { useContext, useEffect, useMemo, useState, lazy } from "react"
import { NoSsr } from "@material-ui/core"
import BlockContext, { BlockProvider } from "../blockly/BlockContext"
import BlockEditor from "../blockly/BlockEditor"
import variablesDsl from "../blockly/dsl/variablesdsl"
import shadowDsl from "../blockly/dsl/shadowdsl"
import modelBlockDsl, { MODEL_BLOCKS } from "./modelblockdsl"
import { addNewDataSet, addNewClassifier } from "./ModelBlockModals"
import fieldsDsl from "../blockly/dsl/fieldsdsl"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import BlockDiagnostics from "../blockly/BlockDiagnostics"
import { visitWorkspace } from "../../../jacdac-ts/src/dsl/workspacevisitor"

import Suspense from "../ui/Suspense"
import { visitToolbox } from "../blockly/toolbox"
import FieldDataSet from "../FieldDataSet"

const RecordDataDialog = lazy(() => import("../dialogs/RecordDataDialog"))

const MB_EDITOR_ID = "mb"
const MB_SOURCE_STORAGE_KEY = "model-block-blockly-xml"
const MB_DATA_STORAGE_KEY = "model-block-data-json"

function getRecordingsFromLocalStorage() {
    const dataObj = localStorage.getItem(MB_DATA_STORAGE_KEY)
    if (dataObj == null || dataObj == undefined) return {}
    const modelEditorData = JSON.parse(dataObj)

    // construct new recordings object
    const allRecordings = {}
    for (const id in modelEditorData["recordings"]) {
        const recordings = modelEditorData["recordings"][id]
        allRecordings[id] = recordings.map(recording => {
            return FieldDataSet.createFromFile(recording)
        })
    }
    return allRecordings
}

function getDataSetsFromLocalStorage() {
    return {}
    /*const dataObj = localStorage.getItem(MB_DATA_STORAGE_KEY)
    if (dataObj == null || dataObj == undefined) return {}
    const modelEditorData = JSON.parse(dataObj)
    return MBModel.createFromFile(modelEditorData["datasets"])*/
}

function getModelsFromLocalStorage() {
    return {}
    /*const dataObj = localStorage.getItem(MB_DATA_STORAGE_KEY)
    if (dataObj == null || dataObj == undefined) return {}
    const modelEditorData = JSON.parse(dataObj)
    return MBModel.createFromFile(modelEditorData["model"])*/
}

function ModelBlockEditorWithContext() {
    // store recordings, datasets, and models
    const [allRecordings, setAllRecordings] = useState(
        getRecordingsFromLocalStorage() // Randi replace with useMemo(() => ..., [])
    ) // dictionary of recording block ids and FieldDataSet arrays
    const [allDataSets, setAllDataSets] = useState(getDataSetsFromLocalStorage) // dictionary of dataset vars and ModelDataSet objs
    const [allModels, setAllModels] = useState(getModelsFromLocalStorage) // dictionary of model vars and MBModel objs

    // block context handles hosting blockly
    const { workspace, workspaceJSON, toolboxConfiguration } =
        useContext(BlockContext)

    const [recordDataDialogVisible, setRecordDataDialogVisible] =
        useState<boolean>(false)
    const toggleRecordDataDialog = () => {
        // update visibility of recording dialog
        const b = !recordDataDialogVisible
        setRecordDataDialogVisible(b)
    }
    const updateAllRecordings = (
        recording: FieldDataSet[],
        blockId: string
    ) => {
        // Add recording data to list of recordings
        allRecordings[blockId] = recording
        updateLocalStorage(allRecordings, null, null)
    }

    const updateLocalStorage = (newRecordings, newDataSets, newModels) => {
        const recordings = newRecordings || allRecordings
        const datasets = newDataSets || allDataSets
        const models = newModels || allModels

        // convert dataset object to JSON string
        const modelBlocksDataJSON = JSON.stringify({
            recordings: recordings,
            datasets: datasets,
            models: models, // Randi TODO make sure you stringify this correctly
        })
        // save JSON string in local storage
        localStorage.setItem(MB_DATA_STORAGE_KEY, modelBlocksDataJSON)
        console.log("Randi updating saved data for blocks: ", {
            recordings,
            datasets,
            models,
        })
    }

    // run this when workspaceJSON changes
    useEffect(() => {
        visitWorkspace(workspaceJSON, {
            visitBlock: block => {
                // Collect data for dataset blocks
                // Randi TODO remove from allRecordings anything that is no longer present on the workspace
                if (block.type == MODEL_BLOCKS + "dataset") {
                    console.log(`Randi dataset block: `, {
                        name: block.inputs[0].fields["dataset_name"],
                        id: block.id,
                        block: block,
                    })
                    // get all nested recordings
                    const recordingBlock = block.inputs.filter(
                        input => input.name == "DATASET_RECORDINGS"
                    )[0].child
                    if (recordingBlock) {
                        console.log(`Randi recording data: `, {
                            recording: allRecordings[recordingBlock.id],
                            block: recordingBlock,
                        })
                        recordingBlock.children?.forEach(childBlock =>
                            console.log(`Randi recording data: `, {
                                recording: allRecordings[childBlock.id],
                                block: childBlock,
                            })
                        )
                    }
                }
                // Collect layers for neural network blocks
                else if (block.type == MODEL_BLOCKS + "nn") {
                    // Randi TODO delete recordings that are no longer present on the workspace
                    console.log(`Randi neural network block: `, {
                        name: block.inputs[0].fields["classifier_name"],
                        id: block.id,
                        block: block,
                    })
                    // get all nested layers
                    const layerBlock = block?.inputs.filter(
                        input => input.name == "NN_LAYERS"
                    )[0].child
                    if (layerBlock) {
                        console.log(`Randi layer data: `, { block: layerBlock })
                        layerBlock.children?.forEach(childBlock =>
                            console.log(`Randi layer data: `, {
                                block: childBlock,
                            })
                        )
                    }
                } else {
                    console.log(`block ${block.type}`, { block })
                }
            },
        })
    }, [workspaceJSON])

    const buttonsWithDialogs = {
        createNewDataSetButton: addNewDataSet,
        createNewRecordingButton: toggleRecordDataDialog,
        createNewClassifierButton: addNewClassifier,
    }
    // set button callbacks
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

    return (
        <>
            <BlockEditor editorId={MB_EDITOR_ID} />
            {Flags.diagnostics && <BlockDiagnostics />}
            {recordDataDialogVisible && (
                <Suspense>
                    <RecordDataDialog
                        open={recordDataDialogVisible}
                        onDone={updateAllRecordings}
                        onClose={toggleRecordDataDialog}
                        recordingCount={Object.keys(allRecordings).length}
                        workspace={workspace}
                    />
                </Suspense>
            )}
        </>
    )
}

export default function ModelBlockEditor() {
    const dsls = useMemo(() => {
        return [modelBlockDsl, shadowDsl, fieldsDsl, variablesDsl]
    }, [])
    return (
        <NoSsr>
            <BlockProvider storageKey={MB_SOURCE_STORAGE_KEY} dsls={dsls}>
                <ModelBlockEditorWithContext />
            </BlockProvider>
        </NoSsr>
    )
}
