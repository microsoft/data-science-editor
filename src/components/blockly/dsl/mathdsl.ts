import jsep from "jsep"
import { ExpressionWithErrors } from "../../jacscript/JacscriptGenerator"
import {
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
const fns = {
    ABS: "abs",
    ROOT: "sqrt",
    LN: "log2",
    LOG10: "log10",
    EXP: "exp",
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
                        ["%{BKY_MATH_SINGLE_OP_ROOT}", "ROOT"],
                        ["ln", "LN"],
                        ["log10", "LOG10"],
                        ["e^", "EXP"],
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
            type: "jacdac_math_constant",
            message0: "%1",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "CONSTANT",
                    options: [
                        ["\u03c0", "PI"],
                        ["e", "E"],
                        ["sqrt(2)", "SQRT2"],
                        ["sqrt(\u00bd)", "SQRT1_2"],
                    ],
                },
            ],
            output: "Number",
            style: "math_blocks",
            tooltip: "%{BKY_MATH_CONSTANT_TOOLTIP}",
            helpUrl: "%{BKY_MATH_CONSTANT_HELPURL}",
        },
        {
            kind: "block",
            type: "jacdac_math_random",
            message0: "random",
            args0: [],
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
                { kind: "block", type: "jacdac_math_constant" },
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
            case "jacdac_math_constant": {
                const cst = inputs[0].fields["constant"].value.toString()
                return {
                    expr: <jsep.Literal>{
                        type: "Literal",
                        raw: `Math.${cst}`,
                    },
                    errors: [],
                }
            }
            case "jacdac_math_random": {
                return {
                    expr: <jsep.CallExpression>{
                        type: "CallExpression",
                        arguments: [],
                        callee: <jsep.Literal>{
                            type: "Literal",
                            raw: "Math.random",
                        },
                    },
                    errors: [],
                }
            }
            case "math_single": // built-in blockly
            case "jacdac_math_single": {
                const argument = blockToExpressionInner(event, inputs[0].child)
                const op = inputs[0].fields["op"].value as string
                return {
                    expr:
                        op === "NEG"
                            ? <jsep.UnaryExpression>{
                                  type: "UnaryExpression",
                                  operator: ops[op] || op,
                                  argument,
                                  prefix: false, // TODO: handle math-negate
                              }
                            : <jsep.CallExpression>{
                                  type: "CallExpression",
                                  arguments: [argument],
                                  callee: <jsep.Literal>{
                                      type: "Literal",
                                      raw: `Math.${fns[op] || op}`,
                                  },
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
