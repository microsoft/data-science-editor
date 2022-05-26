import jsep from "jsep"
import { makeVMBase } from "../../jacscript/JacscriptGenerator"
import {
    BlockReference,
    CODE_STATEMENT_TYPE,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, { CompileCommandToVMOptions } from "./dsl"
import { paletteColorByIndex } from "./palette"

const CLOUD_UPLOAD_BLOCK = "cloud_upload"
const CLOUD_METHOD_EVENT_BLOCK = "cloud_on_method"
const CLOUD_ARGS_LENGTH = 4
const colour = paletteColorByIndex(0)

const cloudDsl: BlockDomainSpecificLanguage = {
    id: "cloud",
    createBlocks: () => [
        {
            kind: "block",
            type: CLOUD_UPLOAD_BLOCK,
            message0: `cloud upload label %1 with data ${Array(
                CLOUD_ARGS_LENGTH
            )
                .fill(0)
                .map((_, i) => `%${i + 2}`)
                .join(" ")}`,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "label",
                    spellcheck: false,
                },
                ...Array(CLOUD_ARGS_LENGTH)
                    .fill(0)
                    .map(
                        (_, i) =>
                            <ValueInputDefinition>{
                                type: "input_value",
                                name: `data${i}`,
                                check: "Number",
                            }
                    ),
            ],
            colour,
            inputsInline: true,
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            tooltip: `Uploads an label and a sequence of numbers`,
            helpUrl: "",
        },
        {
            kind: "block",
            type: CLOUD_METHOD_EVENT_BLOCK,
            message0: `cloud on method %1`,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "label",
                    spellcheck: false,
                },
            ],
            colour,
            inputsInline: true,
            nextStatement: CODE_STATEMENT_TYPE,
            tooltip: `Event raised when a cloud method is invoked`,
            helpUrl: "",
        },
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "Cloud",
            colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: CLOUD_UPLOAD_BLOCK,
                    values: {
                        data0: { kind: "block", type: "math_number" },
                    },
                },
                <BlockReference>{
                    kind: "block",
                    type: CLOUD_METHOD_EVENT_BLOCK,
                },
            ],
        },
    ],
    compileCommandToVM: (options: CompileCommandToVMOptions) => {
        const { block, blockToExpression } = options
        const { type, inputs } = block
        switch (type) {
            case CLOUD_UPLOAD_BLOCK: {
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
            default:
                console.log(type)
                break
        }
    },
}

export default cloudDsl
