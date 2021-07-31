import {
    BlockDefinition,
    CategoryDefinition,
    MODEL_BLOCK_CLASS_STATEMENT_TYPE,
    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
} from "../blockly/toolbox"
import BlockDomainSpecificLanguage from "../blockly/dsl/dsl"

import ExpandModelBlockField from "../blockly/fields/mb/ExpandModelBlockField"
import DataSetBlockField from "../blockly/fields/mb/DataSetBlockField"
import RecordingBlockField from "../blockly/fields/mb/RecordingBlockField"
import SmoothingBlockField from "../blockly/fields/mb/SmoothingBlockField"
import KNNBlockField from "../blockly/fields/mb/KNNBlockField"
import NeuralNetworkBlockField from "../blockly/fields/mb/NeuralNetworkBlockField"
import ConvLayerBlockField from "../blockly/fields/mb/ConvLayerBlockField"
import PoolingLayerBlockField from "../blockly/fields/mb/PoolingLayerBlockField"
import DropoutLayerBlockField from "../blockly/fields/mb/DropoutLayerBlockField"
import FlattenLayerBlockField from "../blockly/fields/mb/FlattenLayerBlockField"
import DenseLayerBlockField from "../blockly/fields/mb/DenseLayerBlockField"

export const MODEL_BLOCKS = "model_block_"
export const MB_DATASET_VAR_TYPE = "ModelBlockDataSet"
export const MB_CLASS_VAR_TYPE = "ModelBlockClass"
export const MB_CLASSIFIER_VAR_TYPE = "ModelBlockClassifier"

const dataset_color = "#123456"
const class_color = "#2466A8"
const processing_color = "#ac2469"
const learning_color = "#561234"
const layer_color = "#97207a"

export class ModelBlockDomainSpecificLanguage
    implements BlockDomainSpecificLanguage
{
    id = "modelBlocks"
    createBlocks() {
        const blocks: BlockDefinition[] = [
            /* DataSet blocks */
            {
                kind: "block",
                type: MODEL_BLOCKS + "dataset",
                message0: "dataset %1 %2",
                args0: [
                    {
                        type: "field_variable",
                        name: "DATASET_NAME",
                        variable: "dataset1",
                        variableTypes: [MB_DATASET_VAR_TYPE],
                        defaultType: MB_DATASET_VAR_TYPE,
                    },
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: DataSetBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                message2: "%1",
                args2: [
                    {
                        type: "input_statement",
                        name: "DATASET_RECORDINGS",
                        check: [MODEL_BLOCK_CLASS_STATEMENT_TYPE],
                    },
                ],
                inputsInline: false,
                colour: dataset_color,
                tooltip:
                    "Use this block to define a dataset; it only takes class blocks. Add more information to datasets by creating new classes and stacking them inside dataset blocks. Click on the inspector icon to view more details about this dataset or to generate a new dataset from this one",
                helpUrl: "",
                hat: true,
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "recording",
                message0: "recording %1 %2 %3",
                args0: [
                    {
                        type: "field_input",
                        name: "RECORDING_NAME",
                        text: "recording0",
                    },
                    {
                        type: "field_variable",
                        name: "CLASS_NAME",
                        variable: "class1",
                        variableTypes: [MB_CLASS_VAR_TYPE],
                        defaultType: MB_CLASS_VAR_TYPE,
                    },
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: RecordingBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: MODEL_BLOCK_CLASS_STATEMENT_TYPE,
                nextStatement: MODEL_BLOCK_CLASS_STATEMENT_TYPE,
                colour: class_color,
                tooltip:
                    "Use this block to define your classes. Click on the inspector icon to view and edit a class",
                helpUrl: "",
            } as BlockDefinition,
            /* Preprocessing Blocks */
            {
                kind: "block",
                type: MODEL_BLOCKS + "standardize",
                message0: "standardize dataset",
                args0: [],
                inputsInline: false,
                previousStatement: MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                nextStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                colour: processing_color,
                tooltip:
                    "Use this block to normalize and scale your dataset values between 0 and 1. This kind of block can only go inside classifier blocks and before layer blocks",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "smooth",
                message0: "smooth data %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: SmoothingBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                nextStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                colour: processing_color,
                tooltip:
                    "Use this block to run a smoothing window filter over your data. This kind of block can only go inside classifier blocks and before layer blocks",
                helpUrl: "",
            } as BlockDefinition,
            /* Learning Blocks */
            {
                kind: "block",
                type: MODEL_BLOCKS + "nn",
                message0: "neural network classifier %1",
                args0: [
                    {
                        type: "field_variable",
                        name: "CLASSIFIER_NAME",
                        variable: "classifier1",
                        variableTypes: [MB_CLASSIFIER_VAR_TYPE],
                        defaultType: MB_CLASSIFIER_VAR_TYPE,
                    },
                ],
                message1: " training data %1 %2",
                args1: [
                    {
                        type: "field_variable",
                        name: "NN_TRAINING",
                        variable: "dataset1",
                        variableTypes: [MB_DATASET_VAR_TYPE],
                        defaultType: MB_DATASET_VAR_TYPE,
                    },
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message2: "%1",
                args2: [
                    {
                        type: NeuralNetworkBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                message3: "%1",
                args3: [
                    {
                        type: "input_statement",
                        name: "NN_LAYERS",
                        check: [
                            MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                            MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                        ],
                    },
                ],
                inputsInline: false,
                colour: learning_color,
                tooltip:
                    "Use this block to define a neural network classifier; it only takes preprocessing and layer blocks.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "conv_layer",
                message0: "convolutional layer %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: ConvLayerBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip:
                    "Use this block to add a 1D convolutional layer to a neural network classifier. Convolutional layers are often used to summarize key features from input data.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "max_pool_layer",
                message0: "max pooling layer %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: PoolingLayerBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "dropout_layer",
                message0: "dropout layer %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: DropoutLayerBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "flatten_layer",
                message0: "flatten %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: FlattenLayerBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "dense_layer",
                message0: "dense layer %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "%1",
                args1: [
                    {
                        type: DenseLayerBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                previousStatement: [
                    MODEL_BLOCK_PREPROCESS_STATEMENT_TYPE,
                    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                ],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "knn",
                message0: "K nearest neighbors classifier %1 %2",
                args0: [
                    {
                        type: "field_variable",
                        name: "CLASSIFIER_NAME",
                        variable: "classifier2",
                        variableTypes: [MB_CLASSIFIER_VAR_TYPE],
                        defaultType: MB_CLASSIFIER_VAR_TYPE,
                    },
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                message1: "training data %1 k %2",
                args1: [
                    {
                        type: "field_variable",
                        name: "KNN_TRAINING",
                        variable: "dataset1",
                        variableTypes: [MB_DATASET_VAR_TYPE],
                        defaultType: MB_DATASET_VAR_TYPE,
                    },
                    {
                        type: "field_number",
                        name: "KNN_K_VALUE",
                        value: 3,
                    },
                ],
                message2: "%1",
                args2: [
                    {
                        type: KNNBlockField.KEY,
                        name: "BLOCK_PARAMS",
                    },
                ],
                inputsInline: false,
                colour: learning_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
        ]
        return blocks
    }

    createCategory() {
        return [<CategoryDefinition>(<unknown>{
                kind: "category",
                name: "DataSet",
                colour: dataset_color,
                contents: [
                    {
                        kind: "label",
                        text: "Recordings",
                    },
                    {
                        kind: "button",
                        text: "Create new recording...",
                        callbackKey: "createNewRecordingButton",
                    },
                    {
                        kind: "label",
                        text: "DataSets",
                    },
                    {
                        kind: "button",
                        text: "Create new dataset...",
                        callbackKey: "createNewDataSetButton",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "dataset",
                    },
                ],
            }), <CategoryDefinition>(<unknown>{
                kind: "category",
                name: "Preprocessing",
                colour: processing_color,
                contents: [
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "standardize",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "smooth",
                    },
                ],
            }), <CategoryDefinition>(<unknown>{
                kind: "category",
                name: "Learning",
                colour: learning_color,
                contents: [
                    {
                        kind: "button",
                        text: "Create new ML classifier...",
                        callbackKey: "createNewClassifierButton",
                    },
                    {
                        kind: "label",
                        text: "K Nearest Neighbors",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "knn",
                    },
                    {
                        kind: "label",
                        text: "Neural Networks",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "nn",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "conv_layer",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "max_pool_layer",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "dropout_layer",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "flatten_layer",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "dense_layer",
                    },
                ],
            })]
    }
}

const modelBlockDsl = new ModelBlockDomainSpecificLanguage()
export default modelBlockDsl
