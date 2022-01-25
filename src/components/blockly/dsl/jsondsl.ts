import {
    BlockDefinition,
    BlockReference,
    BOOLEAN_TYPE,
    DummyInputDefinition,
    JSON_TYPE,
    LabelDefinition,
    PRIMITIVE_TYPES,
    StatementInputDefinition,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage, {
    CompileExpressionToVMOptions,
} from "./dsl"
import { paletteColorByIndex } from "./palette"

const colour = paletteColorByIndex(-2)
const JSON_FIELD_TYPE = "JSONField"
const JSON_OBJECT_BLOCK = "json_object"
const JSON_FIELD_SET_BLOCK = "json_field_set"
const JSON_FIELD_GET_TEMPLATE = "jsonFieldGet"
const JSON_FIELD_VALUE_TYPE = [...PRIMITIVE_TYPES, JSON_TYPE]
const JSON_FIELD_HAS_BLOCK = "json_field_has"

const jsonDSL: BlockDomainSpecificLanguage = {
    id: "json",
    createBlocks: () => [
        <BlockDefinition>{
            kind: "block",
            type: JSON_OBJECT_BLOCK,
            message0: "{ %1 %2 }",
            args0: [
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                <StatementInputDefinition>{
                    type: "input_statement",
                    name: "fields",
                    check: JSON_FIELD_TYPE,
                },
            ],
            output: JSON_TYPE,
            colour,
        },
        <BlockDefinition>{
            kind: "block",
            type: JSON_FIELD_SET_BLOCK,
            message0: "%1: %2",
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "name",
                    spellcheck: false,
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: JSON_FIELD_VALUE_TYPE,
                },
            ],
            previousStatement: JSON_FIELD_TYPE,
            nextStatement: JSON_FIELD_TYPE,
            colour,
        },
        ...PRIMITIVE_TYPES.map(
            output =>
                <BlockDefinition>{
                    kind: "block",
                    type: `json_field_get_as_${output.toLowerCase()}`,
                    message0: `%1 [ %2 ] as ${output.toLowerCase()}`,
                    args0: [
                        <ValueInputDefinition>{
                            type: "input_value",
                            name: "value",
                            check: JSON_TYPE,
                        },
                        <TextInputDefinition>{
                            type: "field_input",
                            name: "name",
                            spellcheck: false,
                        },
                    ],
                    output,
                    colour,
                    template: JSON_FIELD_GET_TEMPLATE,
                }
        ),
        {
            kind: "block",
            type: JSON_FIELD_HAS_BLOCK,
            message0: `has %1 [ %2 ]`,
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: JSON_TYPE,
                },
                <TextInputDefinition>{
                    type: "field_input",
                    name: "name",
                    spellcheck: false,
                },
            ],
            output: BOOLEAN_TYPE,
            colour,
        },
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "JSON",
            colour,
            contents: [
                <LabelDefinition>{
                    kind: "label",
                    text: "Create",
                },
                <BlockReference>{
                    kind: "block",
                    type: JSON_OBJECT_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: JSON_FIELD_SET_BLOCK,
                    values: {
                        value: {
                            kind: "block",
                            type: "math_number",
                        },
                    },
                },
                <LabelDefinition>{
                    kind: "label",
                    text: "Read",
                },
                ...PRIMITIVE_TYPES.map(output => ({
                    kind: "block",
                    type: `json_field_get_as_${output.toLowerCase()}`,
                    values: {
                        value: <BlockReference>{
                            kind: "block",
                            type: "variables_get",
                            check: JSON_TYPE,
                        },
                    },
                })),
                {
                    kind: "block",
                    type: JSON_FIELD_HAS_BLOCK,
                },
            ],
        },
    ],

    compileExpressionToVM(options: CompileExpressionToVMOptions) {
        const { event, block, definition, blockToExpressionInner } = options
        const { type } = block
        const { template } = definition
        if (type === JSON_OBJECT_BLOCK) {
            // TODO: handle json field set block
        } else if (type === JSON_FIELD_SET_BLOCK) {
            // TODO: handle json field get block
        } else if (template === JSON_FIELD_GET_TEMPLATE) {
            // TODO: generate json expression
            console.log("json expr", {
                event,
                block,
                definition,
                blockToExpressionInner,
            })
            return undefined
        }
        // don't know
        return undefined
    },
}

export default jsonDSL
