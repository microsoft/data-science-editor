import { toIdentifier } from "../../devicescript/vm/compile"
import { VMCommand } from "../../devicescript/vm/ir"
import {
    BlockReference,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    InputDefinition,
    SeparatorDefinition,
    ValueInputDefinition,
} from "../toolbox"
import {
    makeVMBase,
    processErrors,
} from "../../devicescript/JacscriptGenerator"
import BlockDomainSpecificLanguage from "./dsl"
import { paletteColorByIndex } from "./palette"

const WAIT_BLOCK = "jacdac_wait"
const ON_START_BLOCK = "jacdac_start"
const REPEAT_EVERY_BLOCK = "jacdac_repeat_every"

const colour = paletteColorByIndex(0)
const loopsDsl: BlockDomainSpecificLanguage = {
    id: "loops",
    createBlocks: () => [
        {
            kind: "block",
            type: WAIT_BLOCK,
            message0: "wait %1",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "time",
                    check: "Number",
                },
            ],
            inputsInline: true,
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            colour,
            tooltip: "Wait the desired time",
            helpUrl: "",
        },
        {
            kind: "block",
            type: ON_START_BLOCK,
            message0: `on start`,
            args0: [],
            colour,
            inputsInline: true,
            tooltip: `Runs code when the device starts`,
            helpUrl: "",
            nextStatement: CODE_STATEMENT_TYPE,
        },
        {
            kind: "block",
            type: REPEAT_EVERY_BLOCK,
            message0: `repeat every %1`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "interval",
                    check: "Number",
                },
            ],
            colour,
            inputsInline: true,
            tooltip: `Repeats code at a given interval in seconds`,
            helpUrl: "",
            nextStatement: CODE_STATEMENT_TYPE,
        },
    ],

    createCategory: () => [
        <SeparatorDefinition>{
            kind: "sep",
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Events",
            colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: REPEAT_EVERY_BLOCK,
                    values: {
                        interval: { kind: "block", type: "jacdac_time_picker" },
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: ON_START_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: WAIT_BLOCK,
                    values: {
                        time: { kind: "block", type: "jacdac_time_picker" },
                    },
                },
            ].filter(b => !!b),
        },
    ],
    compileEventToVM: ({ block, blockToExpression }) => {
        const { type } = block
        if (type === ON_START_BLOCK) {
            return {
                expression: (
                    makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [],
                        callee: toIdentifier("start"),
                    }) as VMCommand
                ).command,
                errors: processErrors(block, []),
            }
        } else if (type === REPEAT_EVERY_BLOCK) {
            const { inputs } = block
            const { expr: time, errors } = blockToExpression(
                undefined,
                inputs[0].child
            )
            return {
                expression: (
                    makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [time],
                        callee: toIdentifier("every"),
                    }) as VMCommand
                ).command,
                errors: processErrors(block, errors),
            }
        }
        return undefined
    },
    compileCommandToVM: ({ event, block, blockToExpression }) => {
        const { type } = block
        if (type === WAIT_BLOCK) {
            const { inputs } = block
            {
                const { expr: time, errors } = blockToExpression(
                    event,
                    inputs[0].child
                )
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [time],
                        callee: toIdentifier("wait"),
                    }),
                    errors: processErrors(block, errors),
                }
            }
        }
        return undefined
    },
}
export default loopsDsl
