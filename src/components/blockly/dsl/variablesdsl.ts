import jsep from "jsep"
import BlockDomainSpecificLanguage from "./dsl"
import {
    toIdentifier,
    toMemberExpression,
} from "../../../../jacdac-ts/src/vm/compile"
import { makeVMBase } from "../../devicescript/JacscriptGenerator"

const variablesDsl: BlockDomainSpecificLanguage = {
    id: "variables",
    types: ["variables_get", "variables_set", "math_change"],
    createCategory: () => [
        {
            kind: "category",
            name: "Variables",
            colour: "%{BKY_VARIABLES_HUE}",
            custom: "VARIABLE",
        },
    ],
    compileExpressionToVM: ({ block /*definition*/ }) => {
        const { type, inputs } = block
        if (type === "variables_get") {
            const { value: variable } = inputs[0].fields.var
            const ret = {
                expr: toMemberExpression("$var", variable.toString()),
                errors: [],
            }
            return ret
        }
        return undefined
    },
    compileCommandToVM: ({
        event,
        block,
        /*definition,*/ blockToExpression,
    }) => {
        const { type, inputs } = block
        if (type === "math_change" || type === "variables_set") {
            const { expr, errors } = blockToExpression(event, inputs[0].child)
            const { value: variable } = inputs[0].fields.var
            return {
                cmd: makeVMBase(block, {
                    type: "CallExpression",
                    arguments: [
                        toMemberExpression("$var", variable.toString()),
                        type === "variables_set"
                            ? expr
                            : ({
                                  type: "BinaryExpression",
                                  operator: "+",
                                  left: toMemberExpression(
                                      "$var",
                                      variable.toString()
                                  ),
                                  right: expr,
                              } as jsep.BinaryExpression),
                    ],
                    callee: toIdentifier("writeLocal"),
                }),
                errors,
            }
        }
        return undefined
    },
}
export default variablesDsl
