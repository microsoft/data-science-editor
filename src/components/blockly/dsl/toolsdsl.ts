import { toIdentifier } from "../../../../jacdac-ts/src/vm/compile"
import { CmdWithErrors, makeVMBase } from "../../jacscript/JacscriptGenerator"
import VariablesField from "../fields/VariablesFields"
//import WatchValueField from "../fields/WatchValueField"
import {
    BlockReference,
    CODE_STATEMENT_TYPE,
    InputDefinition,
    LabelDefinition,
    toolsColour,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const LOG_BLOCK = "tools_log"
const VARIABLES_BLOCK = "tools_variables_view"

const colour = toolsColour

const toolsDSL: BlockDomainSpecificLanguage = {
    id: "tools",
    createBlocks: () => [
        {
            kind: "block",
            type: VARIABLES_BLOCK,
            message0: `variables %1 %2`,
            args0: [
                {
                    type: "input_dummy",
                },
                {
                    type: VariablesField.KEY,
                    name: "variables",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Watch variables values`,
            helpUrl: "",
            template: "meta",
        },        
        {
            kind: "block",
            type: LOG_BLOCK,
            message0: `log %1`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "value",
                },
            ],
            colour,
            inputsInline: true,
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            tooltip: `Log an entry to the console`,
            helpUrl: "",
        },
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "Debugger",
            colour: colour,
            contents: [
                <LabelDefinition>{
                    kind: "label",
                    text: "Variables",
                },
                <BlockReference>{
                    kind: "block",
                    type: VARIABLES_BLOCK,
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Logging",
                },
                {
                    kind: "block",
                    type: LOG_BLOCK,
                    values: {
                        value: { kind: "block", type: "text" },
                    },
                },
            ],
        },
        {
            kind: "sep",
        },
    ],

    compileCommandToVM: ({ block, blockToExpression }): CmdWithErrors => {
        const { type } = block
        if (type === LOG_BLOCK) {
            const { inputs } = block
            const { expr, errors } = blockToExpression(
                undefined,
                inputs[0].child
            )
            return {
                cmd: makeVMBase(block, {
                    type: "CallExpression",
                    arguments: [expr],
                    callee: toIdentifier("log"),
                }),
                errors,
            }
        }
        return undefined
    },
}

export default toolsDSL
