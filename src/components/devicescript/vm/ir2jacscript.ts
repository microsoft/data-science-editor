import jsep from "jsep"
import { camelize } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { serviceSpecificationFromClassIdentifier } from "../../../../jacdac-ts/src/jdom/spec"
import { VMBase, VMCommand, VMHandler, VMIfThenElse, VMProgram } from "./ir"

// TODO:
// - insert read() after register in a read context
// - write a register with fields

export interface JacscriptProgram {
    program: string[]
    debug: string[]
}

export function toJacscript(p: VMProgram): JacscriptProgram {
    if (!p) return null
    const { roles, handlers } = p

    const program: string[] = []
    const debug: string[] = []
    const globals: string[] = []
    let tab = 0
    const add = (code: string, vars: string[] = []) => {
        vars.forEach(v => {
            if (globals.indexOf(v) < 0) globals.push(v)
        })
        program.push(`${" ".repeat(tab * 4)}${code}`)
    }

    // pass over program
    const startHandlers: VMHandler[] = []
    handlers.forEach(h => {
        if (h.commands.length === 0) return
        const [head] = processHandler(h.commands[0] as VMCommand)
        if (head === undefined) return
        else if (head) handlerVisitor(h)
        else startHandlers.push(h)
    })

    // process role handlers
    roles.forEach(r => {
        const spec = serviceSpecificationFromClassIdentifier(r.serviceClass)
        program.unshift(`var ${camelize(r.role)} = roles.${spec.camelName}()`)
    })

    // add onStart handler
    startHandlers.forEach(h => h.commands.slice(1).forEach(visitBase))

    // prepend variables
    globals.forEach(g => program.unshift(`var ${g}`))

    return { program, debug }

    function handlerVisitor(handler: VMHandler) {
        const head = handler.commands[0]
        add(...processHandler(head as VMCommand))
        tab++
        handler.commands.slice(1).forEach(visitBase)
        tab--
        add(`})`)
    }

    function visitBase(base: VMBase) {
        switch (base.type) {
            case "cmd": {
                add(...processCommand(base as VMCommand))
                break
            }
            case "ite": {
                const ite = base as VMIfThenElse
                if (ite) {
                    const [expr, vars] = processExpression(ite.expr)
                    add(`if (${expr}) {`, vars)
                    tab++
                    ite.then?.forEach(visitBase)
                    if (ite.else) {
                        tab--
                        add(`} else {`)
                        tab++
                        ite.else.forEach(visitBase)
                        tab--
                    }
                    add(`}`)
                }
            }
        }
    }

    function processExpression(
        e: jsep.Expression,
        asRead = true
    ): [string, string[]] {
        const vars: string[] = []
        return [processExpr(e), vars]

        function processExpr(e: jsep.Expression): string {
            switch (e.type) {
                case "ArrayExpression": {
                    const ae = e as jsep.ArrayExpression
                    return `[${ae.elements.map(processExpr).join(", ")}]`
                }
                case "CallExpression": {
                    const caller = e as jsep.CallExpression
                    return `${processExpr(caller.callee)}(${caller.arguments
                        .map(processExpr)
                        .join(", ")})`
                }
                case "MemberExpression": {
                    const root = e as jsep.MemberExpression
                    if (root.computed) {
                        return `${processExpr(root.object)}[${processExpr(
                            root.property
                        )}]`
                    } else {
                        const first = `${processExpr(root.object)}`
                        const second = `${processExpr(root.property)}`
                        if (first.startsWith("$var")) {
                            if (globals.indexOf(second) < 0)
                                globals.push(second)
                            if (vars.indexOf(second) < 0) vars.push(second)
                            return second
                        } else if (asRead) {
                            if (second.indexOf(".") > 0) {
                                const [reg, field] = second.split(".")
                                return `${reg}.read().${field}`
                            } else return `${first}.${second}.read()`
                        } else {
                            return `${first}.${second}`
                        }
                    }
                }
                case "BinaryExpression": {
                    const be = e as any
                    return `(${processExpr(be.left)} ${
                        be.operator
                    } ${processExpr(be.right)})`
                }
                case "UnaryExpression": {
                    const ue = e as jsep.UnaryExpression
                    return `${ue.operator}${processExpr(ue.argument)}`
                }
                case "Identifier": {
                    return camelize((e as jsep.Identifier).name)
                }
                case "Literal": {
                    return (e as jsep.Literal).raw
                }
                default:
                    return "TODO"
            }
        }
    }

    function getInst(cmd: VMCommand) {
        return (cmd.command?.callee as jsep.Identifier)?.name
    }

    // these are waits
    function processHandler(handler: VMCommand): [string, string[]] {
        const args = handler.command?.arguments
        const inst = getInst(handler)
        switch (inst) {
            case "awaitEvent": {
                const event = args[0] as jsep.MemberExpression
                const [ev, vars] = processExpression(event, false)
                return [`${ev}.subscribe(() => {`, vars]
            }
            case "awaitChange": {
                const [reg, vars1] = processExpression(args[0], false)
                const [delta, vars2] = processExpression(args[1], false)
                return [
                    `${reg}.onChange(${delta}, () => {`,
                    [...vars1, ...vars2],
                ]
            }
            case "awaitRegister": {
                const [reg, vars] = processExpression(args[0], false)
                return [`${reg}.onChange(0, () => {`, vars]
            }
            case "every": {
                const [reg, vars] = processExpression(args[0], false)
                return [`every(${reg}, () => {`, vars]
            }
            case "roleBound": {
                const [reg, vars1] = processExpression(args[0], false)
                return [`${reg}.onConnected(() => {`, [...vars1]]
            }
            case "cloudMethod": {
                const [role, vars1] = processExpression(args[0], false)
                const [label, vars2] = processExpression(args[1], false)
                return [
                    `${role}.onMethod(${label}, () => {`,
                    [...vars1, ...vars2],
                ]
            }
            case "start": {
                return ["", []]
            }
            case "nop":
                return [undefined, []]
            default: {
                console.debug(
                    `jacscript: unknown handler instruction ${inst}`,
                    handler
                )
                return [`error: unknown handler ${inst}`, []]
            }
        }
    }

    function processCommand(cmd: VMCommand): [string, string[]] {
        const args = cmd.command.arguments
        if (cmd.command.callee.type === "MemberExpression") {
            const roleCall = processExpression(
                cmd.command.callee as jsep.MemberExpression,
                false
            )
            const exprs = args.map(a => processExpression(a))
            return [
                `${roleCall[0]}(${exprs.map(p => p[0]).join(", ")})`,
                [...roleCall[1], ...exprs.flatMap(p => p[1])],
            ]
        } else {
            const inst = getInst(cmd)
            switch (inst) {
                case "wait":
                    return processExpression(cmd.command)
                case "writeRegister": {
                    const rest = cmd.command.arguments.slice(1)
                    const exprs = rest.map(a => processExpression(a))
                    const reg = processExpression(args[0], false)
                    return [
                        `${reg[0]}.write(${exprs.map(p => p[0]).join(", ")})`,
                        [...reg[1], ...exprs.flatMap(p => p[1])],
                    ]
                }
                case "writeLocal": {
                    const lhs = processExpression(args[0], false)
                    const rhs = processExpression(args[1])
                    return [`${lhs[0]} = ${rhs[0]}`, [...lhs[1], ...rhs[1]]]
                }
                default:
                    return processExpression(cmd.command)
            }
        }
    }
}
