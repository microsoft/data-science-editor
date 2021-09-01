import jsep from "jsep"
import { ExpressionWithErrors } from "../../vm/VMgenerator"
import {
    BlockDefinition,
    BlockReference,
    CategoryDefinition,
    OptionsInputDefinition,
    ValueInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const ops = {
    NEG: "-",
    ADD: "+",
    MULTIPLY: "*",
    DIVIDE: "/",
    MINUS: "-",
}

const mathDsl: BlockDomainSpecificLanguage = {
    id: "jacdacmath",
    createBlocks: () => [
        {
            kind: "block",
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "A",
                    check: "Number",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
                        ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
                        ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
                        ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
                    ],
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "B",
                    check: "Number",
                },
            ],
            inputsInline: true,
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_ARITHMETIC_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
        {
            kind: "block",
            type: "jacdac_math_single",
            message0: "%1 %2",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["-", "NEG"],
                        ["%{BKY_MATH_SINGLE_OP_ABSOLUTE}", "ABS"],
                    ],
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "NUM",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_SINGLE_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
        {
            kind: "block",
            type: "jacdac_math_random",
            message0: "random",
            args0: [],
            output: "Number",
            style: "math_blocks",
            vm: function () {
                return Math.random()
            },
        },
        <BlockDefinition>{
            kind: "block",
            type: "jacdac_math_clamp",
            message0: "clamp %1 in [%2, %3]",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "minInclusive",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "maxInclusive",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            vm: function (
                value: number,
                minInclusive: number,
                maxInclusive: number
            ) {
                return value < minInclusive
                    ? minInclusive
                    : value > maxInclusive
                    ? maxInclusive
                    : value
            },
        },
        {
            kind: "block",
            type: "jacdac_math_map",
            message0: "map %1 from [%2, %3] to [%4, %5]",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMax",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMax",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Math",
            colour: "%{BKY_MATH_HUE}",
            contents: [
                {
                    kind: "block",
                    type: "jacdac_math_arithmetic",
                    values: {
                        A: { kind: "block", type: "math_number" },
                        B: { kind: "block", type: "math_number" },
                    },
                },
                {
                    kind: "block",
                    type: "jacdac_math_single",
                    values: {
                        NUM: {
                            kind: "block",
                            type: "math_number",
                        },
                    },
                },
                <BlockReference>{ kind: "block", type: "jacdac_math_random" },
                { kind: "block", type: "jacdac_math_map" },
                { kind: "block", type: "math_number" },
            ],
        },
    ],
    compileExpressionToVM: ({
        event,
        block,
        blockToExpressionInner,
    }): ExpressionWithErrors => {
        const { type, inputs } = block
        switch (type) {
            case "math_single": // built-in blockly
            case "jacdac_math_single": {
                const argument = blockToExpressionInner(event, inputs[0].child)
                const op = inputs[0].fields["op"].value as string
                return {
                    expr: <jsep.UnaryExpression>{
                        type: "UnaryExpression",
                        operator: ops[op] || op,
                        argument,
                        prefix: false, // TODO: handle math-negate
                    },
                    errors: [],
                }
            }
            case "math_arithmetic": // built-in blockly
            case "jacdac_math_arithmetic": {
                const left = blockToExpressionInner(event, inputs[0].child)
                const right = blockToExpressionInner(event, inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return {
                    expr: <jsep.BinaryExpression>{
                        type: "BinaryExpression",
                        operator: ops[op] || op,
                        left,
                        right,
                    },
                    errors: [],
                }
            }
        }
        return undefined
    },
}

export default mathDsl
