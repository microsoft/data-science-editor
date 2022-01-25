import jsep from "jsep"
import { ExpressionWithErrors } from "../../jacscript/JacscriptGenerator"
import BlockDomainSpecificLanguage from "./dsl"

const ops = {
    AND: "&&",
    OR: "||",
    EQ: "===",
    NEQ: "!==",
    LT: "<",
    GT: ">",
    LTE: "<=",
    GTE: ">=",
    NEG: "-",
}

const logicDsl: BlockDomainSpecificLanguage = {
    id: "logic",
    types: [
        "variable_if",
        "logic_compare",
        "logic_operation",
        "logic_negate",
        "logic_boolean",
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "Logic",
            colour: "%{BKY_LOGIC_HUE}",
            contents: [
                {
                    kind: "block",
                    type: "dynamic_if",
                },
                {
                    kind: "block",
                    type: "logic_compare",
                    values: {
                        A: { kind: "block", type: "math_number" },
                        B: { kind: "block", type: "math_number" },
                    },
                },
                {
                    kind: "block",
                    type: "logic_operation",
                    values: {
                        A: { kind: "block", type: "logic_boolean" },
                        B: { kind: "block", type: "logic_boolean" },
                    },
                },
                {
                    kind: "block",
                    type: "logic_negate",
                    values: {
                        BOOL: { kind: "block", type: "logic_boolean" },
                    },
                },
                {
                    kind: "block",
                    type: "logic_boolean",
                },
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
            case "logic_operation": {
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
            case "logic_negate": {
                const argument = blockToExpressionInner(event, inputs[0].child)
                return {
                    expr: <jsep.UnaryExpression>{
                        type: "UnaryExpression",
                        operator: "!",
                        argument,
                        prefix: false, // TODO: handle logic_negate
                    },
                    errors: [],
                }
            }
            case "logic_compare": {
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
export default logicDsl
