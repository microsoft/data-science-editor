import {
    BlockDefinition,
    DummyInputDefinition,
    JSON_TYPE,
    PRIMITIVE_TYPES,
    StatementInputDefinition,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const colour = "#654321"
const JSON_FIELD_TYPE = "JSONField"
const JSON_OBJECT_BLOCK = "json_object"
const JSON_FIELD_SET = "json_field_set"

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
            type: JSON_FIELD_SET,
            message0: "%1: %2",
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "name",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
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
                        },
                    ],
                    output,
                    colour,
                    template: `jsonFieldGet`,
                }
        ),
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "JSON",
            colour,
            contents: [
                <BlockDefinition>{
                    kind: "block",
                    type: JSON_OBJECT_BLOCK,
                },
                <BlockDefinition>{
                    kind: "block",
                    type: JSON_FIELD_SET,
                    values: {
                        value: {
                            kind: "block",
                            type: "math_number",
                        },
                    },
                },
                ...PRIMITIVE_TYPES.map(output => ({
                    kind: "block",
                    type: `json_field_get_as_${output.toLowerCase()}`,
                    values: {
                        value: <BlockDefinition>{
                            kind: "block",
                            type: "variables_get",
                            check: JSON_TYPE,
                        },
                    },
                })),
            ],
        },
    ],
}

export default jsonDSL
