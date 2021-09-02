import React, { lazy } from "react"

import { createStyles, makeStyles, Theme } from "@material-ui/core/styles"

import Blockly, {
    BlockSvg,
    FieldVariable,
    Variables,
    WorkspaceSvg,
} from "blockly"
import {
    MODEL_BLOCKS,
    MB_DATASET_VAR_TYPE,
    MB_CLASSIFIER_VAR_TYPE,
} from "../../model-editor/modelblockdsl"

import FieldDataSet from "../../FieldDataSet"
import MBModel from "../../model-editor/MBModel"
import MBDataSet from "../../model-editor/MBDataSet"
import Suspense from "../../ui/Suspense"
import useChartPalette from "../../useChartPalette"

const ViewDataDialog = lazy(() => import("./ViewDataDialog"))
const RecordDataDialog = lazy(() => import("./RecordDataDialog"))
const TrainModelDialog = lazy(() => import("./TrainModelDialog"))
const TestModelDialog = lazy(() => import("./TestModelDialog"))
const NewClassifierDialog = lazy(() => import("./NewClassifierDialog"))

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            marginBottom: theme.spacing(1),
        },
        grow: {
            flexGrow: 1,
        },
        field: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(1.5),
            width: theme.spacing(25),
        },
        segment: {
            marginTop: theme.spacing(2),
            marginBottom: theme.spacing(2),
        },
        row: {
            marginBottom: theme.spacing(0.5),
        },
        buttons: {
            marginRight: theme.spacing(1),
            marginBottom: theme.spacing(2),
        },
        trend: {
            width: theme.spacing(10),
        },
        vmiddle: {
            verticalAlign: "middle",
        },
    })
)

// handling dialogs within Blockly
export function addNewDataSet(workspace: WorkspaceSvg) {
    // prompt user for dataset name
    Blockly.prompt("Enter new dataset name:", "", newDataSetName => {
        // check if name is already used
        if (newDataSetName != null && newDataSetName != undefined) {
            if (
                newDataSetName != "" &&
                !Variables.nameUsedWithAnyType(newDataSetName, workspace)
            ) {
                // get or create new dataset typed variable
                const newDataSetVar = workspace.createVariable(
                    newDataSetName,
                    MB_DATASET_VAR_TYPE
                )

                // create new dataset block on the workspace
                const newDataSetBlock = workspace.newBlock(
                    MODEL_BLOCKS + "dataset"
                ) as BlockSvg

                // automatically insert the variable name into the new block
                const field = newDataSetBlock.getField(
                    "DATASET_NAME"
                ) as FieldVariable
                field.setValue(newDataSetVar.getId())

                // add new block to the screen
                newDataSetBlock.initSvg()
                newDataSetBlock.render(false)
                workspace.centerOnBlock(newDataSetBlock.id)
            } else {
                setTimeout(
                    () =>
                        Blockly.alert(
                            "That variable name is invalid or already exists"
                        ),
                    10
                )
            }
        }
    })
}

// TODO combine with peceding function to make less redundant
export function addNewClassifier(workspace: WorkspaceSvg) {
    // prompt user for variable name
    Blockly.prompt(`Enter new classifier name:`, ``, newVariableName => {
        // check if name is already used
        if (newVariableName != null && newVariableName != undefined) {
            if (
                newVariableName != "" &&
                !Variables.nameUsedWithAnyType(newVariableName, workspace)
            ) {
                // get or create new classifier typed variable
                workspace.createVariable(
                    newVariableName,
                    MB_CLASSIFIER_VAR_TYPE
                )

                // create new block with new classifier name
                workspace.paste(
                    Blockly.Xml.textToDom(
                        `<block type="model_block_nn"><field name="CLASSIFIER_NAME" variabletype="ModelBlockClassifier">${newVariableName}</field><field name="NN_TRAINING" variabletype="ModelBlockDataSet">dataset1</field><field name="EXPAND_BUTTON">{"parametersVisible":false,"totalParams":0,"totalLayers":0,"totalSize":0,"runTimeInMs":0,"inputShape":[0,0],"optimizer":"adam","numEpochs":200,"lossFn":"categoricalCrossentropy","metrics":"acc"}</field><field name="NN_BUTTONS">{}</field></block>`
                    )
                )
            } else {
                setTimeout(
                    () =>
                        Blockly.alert(
                            "That variable name is invalid or already exists"
                        ),
                    10
                )
            }
        }
    })
}

export default function ModelBlockDialogs(props: {
    visibleDialog: string
    onRecordingDone: (recording: FieldDataSet[], blockId: string) => void
    onModelUpdate: (model: MBModel, blockId: string) => void
    closeModal: () => void
    workspace: WorkspaceSvg
    dataset: MBDataSet
    model: MBModel
    recordingCount: number
    trainedModelCount: number
}) {
    const {
        visibleDialog,
        onRecordingDone,
        onModelUpdate,
        closeModal,
        workspace,
        dataset,
        model,
        recordingCount,
        trainedModelCount,
    } = props

    const classes = useStyles()
    const chartPalette = useChartPalette()

    if (visibleDialog == "dataset") {
        return (
            <Suspense>
                <ViewDataDialog
                    classes={classes}
                    chartPalette={chartPalette}
                    open={visibleDialog == "dataset"}
                    onDone={closeModal}
                    dataset={dataset}
                />
            </Suspense>
        )
    } else if (visibleDialog == "recording") {
        return (
            <Suspense>
                <RecordDataDialog
                    classes={classes}
                    chartPalette={chartPalette}
                    open={visibleDialog == "recording"}
                    onDone={onRecordingDone}
                    recordingCount={recordingCount}
                    workspace={workspace}
                />
            </Suspense>
        )
    } else if (visibleDialog == "model") {
        return (
            <Suspense>
                <TrainModelDialog
                    classes={classes}
                    chartPalette={chartPalette}
                    open={visibleDialog == "model"}
                    onModelUpdate={onModelUpdate}
                    onDone={closeModal}
                    dataset={dataset}
                    model={model}
                    trainedModelCount={trainedModelCount}
                    workspace={workspace}
                />
            </Suspense>
        )
    } else if (visibleDialog == "trained_model") {
        return (
            <Suspense>
                <TestModelDialog
                    classes={classes}
                    chartPalette={chartPalette}
                    open={visibleDialog == "trained_model"}
                    onDone={closeModal}
                    model={model}
                />
            </Suspense>
        )
    } else if (visibleDialog == "classifier") {
        return (
            <Suspense>
                <NewClassifierDialog
                    classes={classes}
                    open={visibleDialog == "classifier"}
                    onDone={closeModal}
                    workspace={workspace}
                />
            </Suspense>
        )
    } else return null
}
