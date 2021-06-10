import {
    BlockDefinition,
    DummyInputDefinition,
    JSON_TYPE,
    StatementInputDefinition,
    TextInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const colour = "#654321"
const JSON_FIELD_TYPE = "JSONField"
const JSON_OBJECT_BLOCK = "json_object"
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
            type: "json_field",
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
            values: {
                value: <BlockDefinition>{
                    kind: "block",
                    type: "math_number",
                },
            },
            previousStatement: JSON_FIELD_TYPE,
            nextStatement: JSON_FIELD_TYPE,
            colour,
        },
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
                    type: "json_field",
                },
            ],
        },
    ],
}

export default jsonDSL
