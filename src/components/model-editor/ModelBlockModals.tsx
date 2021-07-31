import Blockly, { BlockSvg, FieldVariable, Variables } from "blockly"
import {
    MODEL_BLOCKS,
    MB_DATASET_VAR_TYPE,
    MB_CLASSIFIER_VAR_TYPE,
} from "./modelblockdsl"

export function openBlankDialog() {
    console.log("A dialog!")
}

// handling dialogs within Blockly
export function addNewDataSet(workspace) {
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

// Randi TODO is this too redundant with creating a dataset?
export function addNewClassifier(workspace) {
    // prompt user for variable name
    Blockly.prompt(`Enter new classifier name:`, ``, newVariableName => {
        // check if name is already used
        if (newVariableName != null && newVariableName != undefined) {
            if (
                newVariableName != "" &&
                !Variables.nameUsedWithAnyType(newVariableName, workspace)
            ) {
                // get or creat new dataset typed variable
                const newVariable = workspace.createVariable(
                    newVariableName,
                    MB_CLASSIFIER_VAR_TYPE
                )

                // create new dataset block on the workspace
                const newBlock = workspace.newBlock(
                    MODEL_BLOCKS + "knn"
                ) as BlockSvg

                // automatically insert the variable name into the new block
                const field = newBlock.getField(
                    "CLASSIFIER_NAME"
                ) as FieldVariable
                field.setValue(newVariable.getId())

                // add new block to the screen
                newBlock.initSvg()
                newBlock.render(false)
                workspace.centerOnBlock(newBlock.id)
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

/*export function toggleRecordDataDialog() {
    const b = !recordDataDialogVisible
    setRecordDataDialogVisible(b)
}*/
