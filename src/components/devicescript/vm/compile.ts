import jsep from "jsep"
import {
    VMBase,
    VMCommand,
    VMError,
    VMHandler,
    VMIfThenElse,
    VMProgram,
    VMFunctions,
} from "./ir"
import { VMChecker, SpecSymbolResolver } from "./symutils"
import { assert } from "../../../../jacdac-ts/src/jdom/utils"
import {
    serviceSpecificationFromClassIdentifier,
    serviceSpecificationFromName,
} from "../../../../jacdac-ts/src/jdom/spec"

export function toIdentifier(id: string) {
    return {
        type: "Identifier",
        name: id,
    } as jsep.Identifier
}

export function toMemberExpression(
    root: string,
    field: string | jsep.Expression
) {
    return {
        type: "MemberExpression",
        object: toIdentifier(root),
        property: typeof field === "string" ? toIdentifier(field) : field,
        computed: false,
    } as jsep.MemberExpression
}

function handlerVisitor(
    handler: VMHandler,
    visitITE: (ite: VMIfThenElse, time: number) => void,
    visitCommand: (c: VMCommand) => void
) {
    handler.commands.forEach(visitBase)

    function visitBase(base: VMBase) {
        switch (base.type) {
            case "cmd": {
                if (visitCommand) visitCommand(base as VMCommand)
                break
            }
            case "ite": {
                const ite = base as VMIfThenElse
                if (visitITE) visitITE(ite, 0)
                ite?.else?.forEach(visitBase)
                if (visitITE) visitITE(ite, 1)
                ite?.then?.forEach(visitBase)
                if (visitITE) visitITE(ite, 2)
            }
        }
    }
}

export function compileProgram({ roles, handlers }: VMProgram) {
    const newProgram: VMProgram = { roles, handlers: [] }
    // process start blocks
    handlers.forEach(startBlock)
    // remove if-then-else
    newProgram.handlers = handlers.map(h => {
        return { commands: removeIfThenElse(h), errors: h?.errors }
    })
    return newProgram
}

function checkCall(cmd: VMBase, id: string) {
    if (cmd.type === "cmd") {
        const callee = (cmd as VMCommand).command.callee
        if (callee.type === "Identifier") {
            const cid = (callee as jsep.Identifier).name
            return id === cid
        }
    }
    return undefined
}

function startBlock(handler: VMHandler) {
    if (handler.commands.length && checkCall(handler.commands[0], "start")) {
        handler.commands.shift()
        handler.commands.push({
            type: "cmd",
            command: {
                type: "CallExpression",
                callee: toIdentifier("halt"),
                arguments: [],
            },
        } as VMCommand)
    }
}

function removeIfThenElse(handler: VMHandler): VMBase[] {
    const newSequence: VMCommand[] = []
    const labels: { then: string; end: string }[] = []
    let labelId = 1
    handlerVisitor(
        handler,
        (ite, time) => {
            switch (time) {
                case 0: {
                    // create the labels and branch instruction
                    const then = `then_${labelId}`
                    const end = `end_${labelId}`
                    labels.push({ then, end })
                    labelId++
                    newSequence.push({
                        type: "cmd",
                        command: {
                            type: "CallExpression",
                            callee: toIdentifier("branchOnCondition"),
                            arguments: [ite.expr, toIdentifier(then)],
                        },
                    })
                    break
                }
                case 1: {
                    // insert the jump and then label
                    const { then, end } = labels[labels.length - 1]
                    newSequence.push({
                        type: "cmd",
                        command: {
                            type: "CallExpression",
                            callee: toIdentifier("jump"),
                            arguments: [toIdentifier(end)],
                        },
                    })
                    newSequence.push({
                        type: "cmd",
                        command: {
                            type: "CallExpression",
                            callee: toIdentifier("label"),
                            arguments: [toIdentifier(then)],
                        },
                    })
                    break
                }
                case 2: {
                    assert(labels.length > 0)
                    const { end } = labels[labels.length - 1]
                    newSequence.push({
                        type: "cmd",
                        command: {
                            type: "CallExpression",
                            callee: toIdentifier("label"),
                            arguments: [toIdentifier(end)],
                        },
                    })
                    labels.pop()
                }
            }
        },
        cmd => {
            newSequence.push(cmd)
        }
    )
    return newSequence
}

export interface RoleRegister {
    role: string
    register: string
}

export interface RoleEvent {
    role: string
    event: string
}

export const getServiceFromRole = (info: VMProgram) => (role: string) => {
    // lookup in roles first
    const roleFound = info.roles.find(pair => pair.role === role)
    if (roleFound) {
        // must succeed
        const spec = serviceSpecificationFromClassIdentifier(
            roleFound.serviceClass
        )
        assert(!!spec, `service class ${roleFound.serviceClass} not resolved`)
        return { spec }
    } else {
        const spec = serviceSpecificationFromName(role)
        return { spec }
    }
}

export function checkProgram(prog: VMProgram): {
    registers: RoleRegister[]
    events: RoleEvent[]
    errors: VMError[]
} {
    const allErrors: VMError[] = []
    const goodHandlers: VMHandler[] = []
    const errorFun = (e: string) => {
        allErrors.push({ sourceId: undefined, message: e })
    }
    const symbolResolver = new SpecSymbolResolver(
        undefined,
        getServiceFromRole(prog),
        errorFun
    )
    const checker = new VMChecker(symbolResolver, _ => true, errorFun)
    prog.handlers.forEach(h => {
        if (h?.errors.length) {
            h?.errors.forEach(e => allErrors.push(e))
            return
        }
        const errorCount = allErrors.length
        symbolResolver.roles = []
        handlerVisitor(h, undefined, c =>
            checker.checkCommand(c.command, VMFunctions)
        )
        if (h?.errors.length === 0 && allErrors.length === errorCount) {
            h.roles = symbolResolver.roles
            goodHandlers.push(h)
        } else {
            h?.errors.forEach(e => allErrors.push(e))
        }
    })
    prog.handlers = goodHandlers

    return {
        registers: symbolResolver.registers.map(s => {
            const [root, fld] = s.split(".")
            return { role: root, register: fld }
        }),
        events: symbolResolver.events.map(e => {
            const [root, fld] = e.split(".")
            return { role: root, event: fld }
        }),
        errors: allErrors,
    }
}
