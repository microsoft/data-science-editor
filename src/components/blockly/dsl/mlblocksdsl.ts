/* eslint-disable @typescript-eslint/ban-types */
import { Block, Events, Workspace, alert } from "blockly"
import {
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    SeparatorDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import { predictRequest } from "../../blockly/dsl/workers/tf.proxy"
import type {
    TFModelPredictRequest,
    TFModelPredictResponse,
} from "../../../workers/tf/dist/node_modules/tf.worker"
import { resolveWorkspaceServices } from "../WorkspaceContext"
import UseModelField from "../fields/UseModelField"
import palette from "./palette"

import { importModelJSONIntoWorkspace } from "../../fs/fs"

const DATA_DATAVARIABLE_WRITE_BLOCK = "data_dataset_write"
const MODEL_ADD_CLASSIFIER_CALLBACK = "model_add_variable"

export const MODEL_BLOCKS = "model_block_"
export const MB_CLASSIFIER_VAR_TYPE = "ModelBlockClassifier"

const mlBlocksColour = palette()[3]

const mlBlocksDsl: BlockDomainSpecificLanguage = {
    id: "mlBlocks",
    createBlocks: () => [
        {
            kind: "block",
            type: MODEL_BLOCKS + "classifier",
            message0: "predict with %1",
            args0: [
                {
                    type: UseModelField.KEY,
                    name: "modelFile",
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: mlBlocksColour,
            template: "meta",
            dataPreviewField: true,
            passthroughData: false,
            transformData: async (b: Block, data: object[]) => {
                const modelField = b.getField("modelFile") as UseModelField
                const model = await modelField.getModel()

                if (data) data = data.slice(data.length - model.inputShape[0])

                if (data && data.length >= model.inputShape[0]) {
                    const inputData = [
                        data.map(row =>
                            model.inputTypes.map(inputType => row[inputType])
                        ),
                    ]
                    const predictMsg = {
                        worker: "tf",
                        type: "predict",
                        data: {
                            zData: inputData,
                            model: model,
                        },
                    } as TFModelPredictRequest
                    const predResult = (await predictRequest(
                        predictMsg
                    )) as TFModelPredictResponse

                    const transposedResult = []
                    for (const label in predResult.data.predictAll[0]) {
                        transposedResult.push({
                            label: label,
                            confidence: predResult.data.predictAll[0][label],
                        })
                    }

                    return transposedResult
                }
                return Promise.resolve([])
            },
            tooltip: "Use this block to run inference on vm sensor data.",
            helpUrl: "",
        },
    ],
    createCategory: () => [
        <SeparatorDefinition>{
            kind: "sep",
        },
        <CategoryDefinition>{
            kind: "category",
            name: "ML classifiers",
            colour: mlBlocksColour,
            contents: [
                <ButtonDefinition>{
                    kind: "button",
                    text: "Import ML model",
                    callbackKey: MODEL_ADD_CLASSIFIER_CALLBACK,
                    callback: (workspace: Workspace) => {
                        const services = resolveWorkspaceServices(workspace)
                        const directory = services?.workingDirectory
                        if (!directory)
                            alert(
                                "You need to open a directory to import a model classifier."
                            )
                        else {
                            importModelJSONIntoWorkspace(directory.handle)
                                .then(() => directory.sync())
                                .then(() => alert("Files imported!"))
                        }
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: MODEL_BLOCKS + "classifier",
                },
            ],
        },
    ],
    createWorkspaceChangeListener: () => (event: Events.Abstract) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { type, blockId } = event as any
        const isBlockChange =
            type === Events.BLOCK_CHANGE || type === Events.BLOCK_MOVE

        if (isBlockChange) {
            const workspace = event.getEventWorkspace_()
            const block = workspace.getBlockById(blockId)
            if (block?.type !== DATA_DATAVARIABLE_WRITE_BLOCK) return // nothing so see here
        }
    },
}
export default mlBlocksDsl
