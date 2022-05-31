import jsep from "jsep"
import { makeVMBase } from "../../jacscript/JacscriptGenerator"
import ConsoleField from "../fields/ConsoleField"
import VariablesField from "../fields/VariablesFields"
import VideoPlayerField from "../fields/VideoPlayerField"
import {
    BlockReference,
    CODE_STATEMENT_TYPE,
    InputDefinition,
    LabelDefinition,
    toolsColour,
} from "../toolbox"
import BlockDomainSpecificLanguage, { CompileCommandToVMOptions } from "./dsl"

const VARIABLES_BLOCK = "jacdac_variables_view"
const colour = toolsColour
const LOG_BLOCK = "jacdac_log"
const CONSOLE_BLOCK = "jacdac_console_display"
const VIDEO_PLAYER_BLOCK = "jacdac_video_player"

const debugDsl: BlockDomainSpecificLanguage = {
    id: "debug",
    createBlocks: () => [
        {
            kind: "block",
            type: LOG_BLOCK,
            message0: `log %1 %2 %3 %4`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "value0",
                },
                <InputDefinition>{
                    type: "input_value",
                    name: "value1",
                },
                <InputDefinition>{
                    type: "input_value",
                    name: "value2",
                },
                <InputDefinition>{
                    type: "input_value",
                    name: "value3",
                },
            ],
            colour,
            inputsInline: true,
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            tooltip: `Log an entry to the console`,
            helpUrl: "",
        },
        {
            kind: "block",
            type: CONSOLE_BLOCK,
            message0: `console %1 %2`,
            args0: [
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: ConsoleField.KEY,
                    name: "console",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Display console messages`,
            helpUrl: "",
            template: "meta",
        },
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
            type: VIDEO_PLAYER_BLOCK,
            message0: `video %1 %2`,
            args0: [
                {
                    type: "input_dummy",
                },
                {
                    type: VideoPlayerField.KEY,
                    name: "video",
                    url: "Jqn2YCUkWqk",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Watch documentation video`,
            helpUrl: "",
            template: "meta",
        },
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "Debug",
            colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: LOG_BLOCK,
                    values: {
                        value0: { kind: "block", type: "text" },
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: LOG_BLOCK,
                    values: {
                        value0: { kind: "block", type: "text" },
                        value1: { kind: "block", type: "math_number" },
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: CONSOLE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: VARIABLES_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: "text",
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Docs",
                },
                <BlockReference>{
                    kind: "block",
                    type: VIDEO_PLAYER_BLOCK,
                    url: "asdfasfd",
                },
            ],
        },
    ],
    compileCommandToVM: (options: CompileCommandToVMOptions) => {
        const { block, blockToExpression } = options
        const { type, inputs } = block
        switch (type) {
            case LOG_BLOCK: {
                const exprsErrors = inputs
                    .filter(i => i.child)
                    .map(a => blockToExpression(undefined, a.child))
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: exprsErrors.map(e => e.expr),
                        callee: <jsep.Literal>{
                            type: "Literal",
                            raw: "console.log",
                        },
                    }),
                    errors: exprsErrors.flatMap(e => e.errors),
                }
            }
            default:
                console.log(type)
                break
        }
    },
}

export default debugDsl
