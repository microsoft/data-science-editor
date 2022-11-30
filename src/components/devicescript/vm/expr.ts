import jsep from "jsep"

export type GetValue = (
    e: jsep.MemberExpression | string,
    reportUpdate: boolean
) => any

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type StartMap = { e: jsep.Expression; v: any }[]

export type CallEvaluator = (
    ce: jsep.CallExpression,
    ee: VMExprEvaluator
) => any

export function unparse(e: jsep.Expression): string {
    switch (e.type) {
        case "ArrayExpression": {
            const ae = e as jsep.ArrayExpression
            return `[${ae.elements.map(unparse).join(", ")}]`
        }
        case "CallExpression": {
            const caller = e as jsep.CallExpression
            return `${unparse(caller.callee)}(${caller.arguments
                .map(unparse)
                .join(", ")})`
        }
        case "MemberExpression": {
            const root = e as jsep.MemberExpression
            return root.computed
                ? `${unparse(root.object)}[${unparse(root.property)}]`
                : `${unparse(root.object)}.${unparse(root.property)}`
        }
        case "BinaryExpression": {
            const be = e as any
            return `(${unparse(be.left)} ${be.operator} ${unparse(be.right)})`
        }
        case "UnaryExpression": {
            const ue = e as jsep.UnaryExpression
            return `${ue.operator}${unparse(ue.argument)}`
        }
        case "Identifier": {
            return (e as jsep.Identifier).name
        }
        case "Literal": {
            return (e as jsep.Literal).raw
        }
        default:
            return "TODO"
    }
}

export class VMExprEvaluator {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private exprStack: any[] = []
    private reportUpdate = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(private env: GetValue, private callEval: CallEvaluator) {}

    public tos() {
        return this.exprStack[this.exprStack.length - 1]
    }

    public pop() {
        return this.exprStack.pop()
    }

    public async evalAsync(e: jsep.Expression, reportUpdate = false) {
        this.exprStack = []
        this.reportUpdate = reportUpdate
        await this.visitExpressionAsync(e)
        return this.exprStack.pop()
    }

    public async visitExpressionAsync(e: jsep.Expression) {
        switch (e.type) {
            case "ArrayExpression": {
                // nothing to do here yet (only used for event function)
                break
            }

            case "CallExpression": {
                if (this.callEval) {
                    const ret = this.callEval(<jsep.CallExpression>e, this)
                    this.exprStack.push(ret)
                } else this.exprStack.push(undefined)
                break
            }

            case "BinaryExpression": {
                const be = <jsep.BinaryExpression>e
                if (be.operator === "&&" || be.operator === "||") {
                    await this.visitExpressionAsync(be.left)
                    switch (be.operator) {
                        case "||":
                            if (this.tos()) return
                            else await this.visitExpressionAsync(be.right)
                            return
                        case "&&":
                            if (!this.tos()) return
                            else await this.visitExpressionAsync(be.right)
                            return
                    }
                }
                await this.visitExpressionAsync(be.left)
                await this.visitExpressionAsync(be.right)
                const right = this.exprStack.pop()
                const left = this.exprStack.pop()
                switch (be.operator) {
                    case "+":
                        this.exprStack.push(left + right)
                        return
                    case "-":
                        this.exprStack.push(left - right)
                        return
                    case "/":
                        this.exprStack.push(left / right)
                        return
                    case "*":
                        this.exprStack.push(left * right)
                        return
                    case "%":
                        this.exprStack.push(left % right)
                        return
                    case ">>":
                        this.exprStack.push(left >> right)
                        return
                    case ">>>":
                        this.exprStack.push(left >>> right)
                        return
                    case "<<":
                        this.exprStack.push(left << right)
                        return
                    case "|":
                        this.exprStack.push(left | right)
                        return
                    case "&":
                        this.exprStack.push(left & right)
                        return
                    case "^":
                        this.exprStack.push(left ^ right)
                        return
                    case "==":
                        this.exprStack.push(left == right)
                        return
                    case "!=":
                        this.exprStack.push(left != right)
                        return
                    case "===":
                        this.exprStack.push(left === right)
                        return
                    case "!==":
                        this.exprStack.push(left !== right)
                        return
                    case "<":
                        this.exprStack.push(left < right)
                        return
                    case ">":
                        this.exprStack.push(left > right)
                        return
                    case "<=":
                        this.exprStack.push(left <= right)
                        return
                    case ">=":
                        this.exprStack.push(left >= right)
                        return
                }
                break
            }

            case "UnaryExpression": {
                const ue = <jsep.UnaryExpression>e
                await this.visitExpressionAsync(ue.argument)
                const top = this.exprStack.pop()
                switch (ue.operator) {
                    case "ABS":
                        this.exprStack.push(Math.abs(top))
                        return
                    case "!":
                        this.exprStack.push(!top)
                        return
                    case "~":
                        this.exprStack.push(~top)
                        return
                    case "-":
                        this.exprStack.push(-top)
                        return
                    case "+":
                        this.exprStack.push(+top)
                        return
                }
                break
            }

            case "MemberExpression": {
                // for now, we don't support evaluation of obj or prop
                // of obj.prop
                const val = await this.env(
                    e as jsep.MemberExpression,
                    this.reportUpdate
                )
                //if (val === undefined) {
                //    throw new VMError(VMCode.InternalError, `lookup of ${unparse(e)} failed`)
                //}
                this.exprStack.push(val)
                return
            }
            case "Identifier": {
                const id = <jsep.Identifier>e
                const val = await this.env(id.name, this.reportUpdate)
                // if (val === undefined)
                //    throw new VMError(VMCode.InternalError, `lookup of ${id.name} failed`)
                this.exprStack.push(val)
                return
            }
            case "Literal": {
                const lit = <jsep.Literal>e
                this.exprStack.push(lit.value)
                return
            }
            default:
        }
    }
}
