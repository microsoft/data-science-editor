import { toIdentifier } from "../../../../jacdac-ts/src/vm/compile"
import { CmdWithErrors, makeVMBase } from "../../vm/VMgenerator"
import JDomTreeField from "../fields/JDomTreeField"
import LogViewField from "../fields/LogViewField"
import TwinField from "../fields/TwinField"
import VariablesField from "../fields/VariablesFields"
import WatchValueField from "../fields/WatchValueField"
import {
    BlockReference,
    InputDefinition,
    LabelDefinition,
    VariableInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import servicesDSL from "./servicesdsl"

const colour = "#888"
const INSPECT_BLOCK = "jacdac_tools_inspect"
const WATCH_BLOCK = "jacdac_tools_watch"
const LOG_BLOCK = "jacdac_tools_log"
const VIEW_LOG_BLOCK = "jacdac_tools_log_view"
const VARIABLES_BLOCK = "jacdac_variables_view"
export const TWIN_BLOCK = "jacdac_tools_twin"

const toolsDSL: BlockDomainSpecificLanguage = {
    id: "tools",
    createBlocks: () => [
        {
            kind: "block",
            type: TWIN_BLOCK,
            message0: `view %1 %2 %3`,
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "none",
                    variableTypes: [
                        "client",
                        ...servicesDSL.supportedServices.map(
                            service => service.shortId
                        ),
                    ],
                    defaultType: "client",
                },
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: TwinField.KEY,
                    name: "twin",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Twin of the selected service`,
            helpUrl: "",
            template: "meta",
        },
        {
            kind: "block",
            type: INSPECT_BLOCK,
            message0: `inspect %1 %2 %3`,
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "none",
                    variableTypes: [
                        "client",
                        ...servicesDSL.supportedServices.map(
                            service => service.shortId
                        ),
                    ],
                    defaultType: "client",
                },
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: JDomTreeField.KEY,
                    name: "twin",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Inspect a service`,
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
            template: "meta"
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
            previousStatement: null,
            nextStatement: null,
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
    ],
    createCategory: () => [
        {
            kind: "sep",
        },
        {
            kind: "category",
            name: "Tools",
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
                    text: "Dashboard",
                },
                <BlockReference>{
                    kind: "block",
                    type: TWIN_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: INSPECT_BLOCK,
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
            ],
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
