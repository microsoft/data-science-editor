import {
    BlockDefinition,
    CategoryDefinition,
    MODEL_BLOCK_CLASS_STATEMENT_TYPE,
    MODEL_BLOCK_LAYER_STATEMENT_TYPE,
    TextInputDefinition,
    VariableInputDefinition,
} from "../blockly/toolbox"
import BlockDomainSpecificLanguage from "../blockly/dsl/dsl"

import ExpandModelBlockField from "../blockly/fields/mb/ExpandModelBlockField"
import DataSetBlockButton from "../blockly/fields/mb/DataSetBlockButton"
import NeuralNetworkBlockButton from "../blockly/fields/mb/NeuralNetworkBlockButtons"
import TrainedModelBlockField from "../blockly/fields/mb/TrainedModelBlockField"

export const MODEL_BLOCKS = "model_block_"
export const MB_DATASET_VAR_TYPE = "ModelBlockDataSet"
export const MB_CLASS_VAR_TYPE = "ModelBlockClass"
export const MB_CLASSIFIER_VAR_TYPE = "ModelBlockClassifier"

const dataset_color = "#123456"
const class_color = "#2466A8"
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
                        type: DataSetBlockButton.KEY,
                        name: "DATASET_BUTTONS",
                    },
                ],
                message2: "%1",
                args2: [
                    {
                        type: "input_statement",
                        name: "LAYER_INPUTS",
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
                inputsInline: false,
                previousStatement: MODEL_BLOCK_CLASS_STATEMENT_TYPE,
                nextStatement: MODEL_BLOCK_CLASS_STATEMENT_TYPE,
                colour: class_color,
                tooltip:
                    "Use this recording block to define your classes. Click on the plus icon to download this recording",
                helpUrl: "",
            } as BlockDefinition,
            /* Classifier Blocks */
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
                    } as VariableInputDefinition,
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
                        type: NeuralNetworkBlockButton.KEY,
                        name: "NN_BUTTONS",
                    },
                ],
                message3: "%1",
                args3: [
                    {
                        type: "input_statement",
                        name: "LAYER_INPUTS",
                        check: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                    },
                ],
                inputsInline: false,
                colour: learning_color,
                tooltip:
                    "Use this block to define a neural network classifier; it only takes layer blocks.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "trained_nn",
                message0: "trained model %1",
                args0: [
                    {
                        type: "field_input",
                        name: "TRAINED_MODEL_NAME",
                        text: "classifier1.t",
                    } as TextInputDefinition,
                ],
                message1: "testing data %1",
                args1: [
                    {
                        type: "field_variable",
                        name: "MODEL_TEST_SET",
                        variable: "dataset1",
                        variableTypes: [MB_DATASET_VAR_TYPE],
                        defaultType: MB_DATASET_VAR_TYPE,
                    },
                ],
                message2: "display %1",
                args2: [
                    {
                        type: "field_dropdown",
                        options: ["confusion matrix", "dataset plot"].map(s => [
                            s,
                            s,
                        ]),
                        name: "SELECTED_CHART",
                    },
                ],
                message3: "%1",
                args3: [
                    {
                        type: TrainedModelBlockField.KEY,
                        name: "TRAINED_MODEL_DISPLAY",
                    },
                ],
                inputsInline: false,
                colour: learning_color,
                tooltip:
                    "Use this block to test a trained model with different datasets.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "conv1d_layer",
                message0: "convolution1d (16, 2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip:
                    "Use this block to add a 1D convolutional layer to a neural network classifier. Convolutional layers are often used to summarize key features from input data.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "maxpool1d_layer",
                message0: "max pool1d (2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "avgpool1d_layer",
                message0: "average pool1d (2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,

            {
                kind: "block",
                type: MODEL_BLOCKS + "conv2d_layer",
                message0: "convolution2d (16, 2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip:
                    "Use this block to add a 2D convolutional layer to a neural network classifier. Convolutional layers are often used to summarize key features from input data.",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "maxpool2d_layer",
                message0: "max pool2d (2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "avgpool2d_layer",
                message0: "average pool2d (2, 1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "dropout_layer",
                message0: "dropout (0.1) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
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
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
            {
                kind: "block",
                type: MODEL_BLOCKS + "dense_layer",
                message0: "dense (4, relu) %1",
                args0: [
                    {
                        type: ExpandModelBlockField.KEY,
                        name: "EXPAND_BUTTON",
                    },
                ],
                inputsInline: false,
                previousStatement: [MODEL_BLOCK_LAYER_STATEMENT_TYPE],
                nextStatement: MODEL_BLOCK_LAYER_STATEMENT_TYPE,
                colour: layer_color,
                tooltip: "",
                helpUrl: "",
            } as BlockDefinition,
        ]
        return blocks
    }

    createCategory() {
        return [<CategoryDefinition>(<unknown>{
                kind: "category",
                name: "Data sets",
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
                        text: "Datasets",
                    },
                    {
                        kind: "button",
                        text: "Create new dataset variable...",
                        callbackKey: "createNewDataSetButton",
                    },
                    {
                        kind: "block",
                        type: MODEL_BLOCKS + "dataset",
                    },
                ],
            }), <CategoryDefinition>(<unknown>{
                kind: "category",
                name: "Models",
                colour: learning_color,
                contents: [
                    {
                        kind: "label",
                        text: "Classifiers",
                    },
                    {
                        kind: "button",
                        text: "Create new classifier variable...",
                        callbackKey: "createNewClassifierButton",
                    },
                    {
                        kind: "label",
                        text: "Layers",
                    },
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_conv1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0],"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field></block>`,
                    },
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_maxpool1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0],"poolSize":2,"strideSize":1}</field></block>`,
                    },
                    /*{
                        kind: "block",
                        blockxml: `<block type="model_block_avgpool1d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0],"poolSize":2,"strideSize":1}</field></block>`,
                    },*/
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_conv2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0,0],"numFilters":16,"kernelSize":2,"strideSize":1,"activation":"relu"}</field></block>`,
                    },
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_maxpool2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0,0],"poolSize":2,"strideSize":1}</field></block>`,
                    },
                    /*{
                        kind: "block",
                        blockxml: `<block type="model_block_avgpool2d_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0,0],"poolSize":2,"strideSize":1}</field></block>`,
                    },*/
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_dropout_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0,0],"rate":0.1}</field></block>`,
                    },
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_flatten_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0]}</field></block>`,
                    },
                    {
                        kind: "block",
                        blockxml: `<block type="model_block_dense_layer"><field name="EXPAND_BUTTON">{"parametersVisible":false,"percentSize":0,"percentParams":0,"runTimeInMs":0,"outputShape":[0],"numUnits":4,"activation":"relu"}</field></block>`,
                    },
                ],
            })]
    }
}

const modelBlockDsl = new ModelBlockDomainSpecificLanguage()
export default modelBlockDsl
