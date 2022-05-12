import jsep from "jsep"
import { toMap } from "../../../../jacdac-ts/src/jdom/utils"
import {
    ExpressionWithErrors,
    makeVMBase,
} from "../../jacscript/JacscriptGenerator"
import {
    BlockReference,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CompileCommandToVMOptions,
    CompileExpressionToVMOptions,
} from "./dsl"
import { paletteColorByIndex } from "./palette"

const JACSCRIPT_CLOUD_CONNECTED_BLOCK = "jacscript_cloud_connected"
const JACSCRIPT_CLOUD_UPLOAD_BLOCK = "jacscript_cloud_upload"
const JACSCRIPT_CLOUD_MESSAGE_BLOCK = "jacscript_cloud_message"
const colour = paletteColorByIndex(4)
const UPLOAD_ARGS = 1

const cloudDsl: BlockDomainSpecificLanguage = {
    id: "cloud",
    createBlocks: () => [
        {
            kind: "block",
            type: JACSCRIPT_CLOUD_CONNECTED_BLOCK,
            message0: `cloud connected`,
            colour,
            args0: [],
            inputsInline: true,
            output: "Boolean",
        },
        {
            kind: "block",
            type: JACSCRIPT_CLOUD_UPLOAD_BLOCK,
            message0: `cloud upload ${Array(UPLOAD_ARGS + 1)
                .fill(0)
                .map((_, i) => `%${i + 1}`)
                .join(" ")}`,
            colour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "label",
                    spellcheck: false,
                },
                ...Array(UPLOAD_ARGS)
                    .fill(0)
                    .map(
                        (_, i) =>
                            <ValueInputDefinition>{
                                type: "input_value",
                                name: `arg${i}`,
                                check: "Number",
                            }
                    ),
            ],
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            inputsInline: true,
        },
        {
            kind: "block",
            type: JACSCRIPT_CLOUD_MESSAGE_BLOCK,
            message0: `on cloud message %1`,
            colour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "label",
                    spellcheck: false,
                },
            ],
            nextStatement: CODE_STATEMENT_TYPE,
            inputsInline: true,
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Cloud",
            colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: JACSCRIPT_CLOUD_UPLOAD_BLOCK,
                    values: {
                        ...toMap(
                            Array(UPLOAD_ARGS).fill(0),
                            (_, i) => `arg${i}`,
                            (_, i) => ({
                                name: `arg${i}`,
                                kind: "block",
                                type: "math_number",
                            })
                        ),
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: JACSCRIPT_CLOUD_MESSAGE_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: JACSCRIPT_CLOUD_CONNECTED_BLOCK,
                },
            ],
        },
    ],
    compileExpressionToVM: (options: CompileExpressionToVMOptions) => {
        const { block } = options
        const { type } = block
        switch (type) {
            case JACSCRIPT_CLOUD_CONNECTED_BLOCK: {
                return <ExpressionWithErrors>{
                    expr: <jsep.Literal>{
                        type: "Literal",
                        raw: "cloud.connected",
                    },
                    errors: [],
                }
            }
            default:
                return undefined
        }
    },
    compileCommandToVM: (options: CompileCommandToVMOptions) => {
        const { block, blockToExpression } = options
        const { type, inputs } = block
        switch (type) {
            case JACSCRIPT_CLOUD_CONNECTED_BLOCK: {
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [],
                        callee: <jsep.Literal>{
                            type: "Literal",
                            raw: "cloud.connected",
                        },
                    }),
                    errors: [],
                }
            }
            case JACSCRIPT_CLOUD_UPLOAD_BLOCK: {
                const label = inputs[0].fields["label"].value as string
                const exprsErrors = inputs
                    .filter(i => i.child)
                    .map(a => blockToExpression(undefined, a.child))
                return {
                    cmd: makeVMBase(block, {
                        type: "CallExpression",
                        arguments: [
                            <jsep.Literal>{
                                type: "Literal",
                                value: label,
                                raw: `"${label}"`,
                            },
                            ...exprsErrors.map(e => e.expr),
                        ],
                        callee: <jsep.Literal>{
                            type: "Literal",
                            raw: "cloud.upload",
                        },
                    }),
                    errors: exprsErrors.flatMap(e => e.errors),
                }
            }
        }
        return undefined
    },
}

export default cloudDsl
