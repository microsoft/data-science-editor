import { BlockSvg } from "blockly"
import { toIdentifier } from "../../../../jacdac-ts/src/vm/compile"
import { CmdWithErrors, makeVMBase } from "../../vm/VMgenerator"
import LogViewField from "../fields/LogViewField"
import VariablesField from "../fields/VariablesFields"
import WatchValueField from "../fields/WatchValueField"
import {
    BlockDefinition,
    BlockReference,
    CODE_STATEMENT_TYPE,
    DATA_SCIENCE_STATEMENT_TYPE,
    identityTransformData,
    InputDefinition,
    LabelDefinition,
    NumberInputDefinition,
    toolsColour,
} from "../toolbox"
import type { DataRecordWindowRequest } from "../../../workers/data/dist/node_modules/data.worker"
import BlockDomainSpecificLanguage from "./dsl"
import postTransformData from "./workers/data.proxy"

const WATCH_BLOCK = "tools_watch"
const LOG_BLOCK = "tools_log"
const VIEW_LOG_BLOCK = "tools_log_view"
const VARIABLES_BLOCK = "tools_variables_view"
const RECORD_WINDOW_BLOCK = "tools_record_window"

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
            type: WATCH_BLOCK,
            message0: `watch %1 %2`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "value",
                },
                <InputDefinition>{
                    type: WatchValueField.KEY,
                    name: "watch",
                },
            ],
            colour,
            inputsInline: true,
            tooltip: `Watch a value in the editor`,
            helpUrl: "",
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            transformData: identityTransformData,
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
        {
            kind: "block",
            type: VIEW_LOG_BLOCK,
            message0: `console %1 %2`,
            args0: [
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: LogViewField.KEY,
                    name: "watch",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `View console content`,
            template: "meta",
        },
        <BlockDefinition>{
            kind: "block",
            type: RECORD_WINDOW_BLOCK,
            message0: "record last %1 s",
            args0: [
                <NumberInputDefinition>{
                    type: "field_number",
                    name: "horizon",
                    value: 10,
                },
            ],
            inputsInline: false,
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour: colour,
            template: "meta",
            dataPreviewField: true,
            transformData: async (
                block: BlockSvg,
                data: { time: number }[],
                previousData: { time: number }[]
            ) => {
                const horizon = block.getFieldValue("horizon") || 10
                return postTransformData(<DataRecordWindowRequest>{
                    type: "record_window",
                    data,
                    previousData,
                    horizon,
                })
            },
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
                <BlockReference>{
                    kind: "block",
                    type: WATCH_BLOCK,
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
                {
                    kind: "block",
                    type: VIEW_LOG_BLOCK,
                },
                <BlockDefinition>{
                    kind: "block",
                    type: RECORD_WINDOW_BLOCK,
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
    compileEventToVM: ({ block, blockToExpression }) => {
        const { type } = block
        if (type === WATCH_BLOCK) {
            const { inputs } = block
            const { expr, errors } = blockToExpression(
                undefined,
                inputs[0].child
            )
            return {
                expression: <jsep.CallExpression>{
                    type: "CallExpression",
                    arguments: [expr],
                    callee: toIdentifier("watch"),
                },
                errors,
                meta: true,
            }
        }
        return undefined
    },
}

export default toolsDSL
