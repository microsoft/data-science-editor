import { BlockJSON, WorkspaceJSON } from "./jsongenerator"
import {
    VMBase,
    VMHandler,
    VMProgram,
    VMRole,
    VMIfThenElse,
    VMError,
    VMCommand,
} from "../../../jacdac-ts/src/vm/ir"
import {
    toMemberExpression,
    toIdentifier,
    RoleEvent,
} from "../../../jacdac-ts/src/vm/compile"

import { assert } from "../../../jacdac-ts/src/jdom/utils"
import {
    BUILTIN_TYPES,
    CommandBlockDefinition,
    EventFieldDefinition,
    RegisterBlockDefinition,
    resolveServiceBlockDefinition,
    WAIT_BLOCK,
} from "./toolbox"
import Blockly from "blockly"
import BlockDomainSpecificLanguage from "./dsl/dsl"

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
    ADD: "+",
    MULTIPLY: "*",
    DIVIDE: "/",
    MINUS: "-",
}

export interface ExpressionWithErrors {
    expr: jsep.Expression
    errors: VMError[]
}

export const makeVMBase = (block: BlockJSON, command: jsep.CallExpression) => {
    return {
        sourceId: block.id,
        type: "cmd",
        command,
    } as VMBase
}

export const processErrors = (block: BlockJSON, errors: VMError[]) => {
    return errors.map((e: VMError) => {
        return {
            sourceId: e.sourceId ? e.sourceId : block.id,
            message: e.message,
        }
    })
}

export default function workspaceJSONToVMProgram(
    workspace: WorkspaceJSON,
    dsls: BlockDomainSpecificLanguage[]
): VMProgram {
    console.debug(`compile vm`, { workspace, dsls })

    const roles: VMRole[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortId: v.type }))

    class EmptyExpression extends Error {}

    const blockToExpression: (
        ev: RoleEvent,
        block: BlockJSON
    ) => ExpressionWithErrors = (ev: RoleEvent, blockIn: BlockJSON) => {
        const errors: VMError[] = []

        const blockToExpressionInner = (ev: RoleEvent, block: BlockJSON) => {
            if (!block) {
                throw new EmptyExpression()
            }
            const { type, value, inputs } = block
            console.log(`block2e`, { ev, block, type, value, inputs })

            if (value !== undefined)
                // literal
                return <jsep.Literal>{
                    type: "Literal",
                    value: value,
                    raw: value + "",
                }

            switch (type) {
                case "jacdac_math_single": {
                    const argument = blockToExpressionInner(ev, inputs[0].child)
                    const op = inputs[0].fields["op"].value as string
                    return <jsep.UnaryExpression>{
                        type: "UnaryExpression",
                        operator: ops[op] || op,
                        argument,
                        prefix: false, // TODO:?
                    }
                }
                case "jacdac_math_arithmetic": {
                    const left = blockToExpressionInner(ev, inputs[0].child)
                    const right = blockToExpressionInner(ev, inputs[1].child)
                    const op = inputs[1].fields["op"].value as string
                    return <jsep.BinaryExpression>{
                        type: "BinaryExpression",
                        operator: ops[op] || op,
                        left,
                        right,
                    }
                }
                case "logic_operation": {
                    const left = blockToExpressionInner(ev, inputs[0].child)
                    const right = blockToExpressionInner(ev, inputs[1].child)
                    const op = inputs[1].fields["op"].value as string
                    return <jsep.LogicalExpression>{
                        type: "LogicalExpression",
                        operator: ops[op] || op,
                        left,
                        right,
                    }
                }
                case "logic_negate": {
                    const argument = blockToExpressionInner(ev, inputs[0].child)
                    return <jsep.UnaryExpression>{
                        type: "UnaryExpression",
                        operator: "!",
                        argument,
                        prefix: false, // TODO:?
                    }
                }
                case "logic_compare": {
                    const left = blockToExpressionInner(ev, inputs[0].child)
                    const right = blockToExpressionInner(ev, inputs[1].child)
                    const op = inputs[1].fields["op"].value as string
                    return <jsep.BinaryExpression>{
                        type: "BinaryExpression",
                        operator: ops[op] || op,
                        left,
                        right,
                    }
                }
                default: {
                    const def = resolveServiceBlockDefinition(type)
                    if (!def) {
                        console.warn(`unknown block ${type}`, {
                            type,
                            ev,
                            block,
                            d: Blockly.Blocks[type],
                        })
                    } else {
                        const { template } = def
                        console.log("get", { type, def, template })
                        switch (template) {
                            case "register_get": {
                                const { register } =
                                    def as RegisterBlockDefinition
                                const { value: role } = inputs[0].fields["role"]
                                const field = inputs[0].fields["field"]
                                return toMemberExpression(
                                    role as string,
                                    field
                                        ? toMemberExpression(
                                              register.name,
                                              field.value as string
                                          )
                                        : register.name
                                )
                            }
                            case "event_field": {
                                const { event } = def as EventFieldDefinition
                                if (ev.event !== event.name) {
                                    errors.push({
                                        sourceId: block.id,
                                        message: `Event ${event.name} is not available in this handler.`,
                                    })
                                }
                                const field = inputs[0].fields["field"]
                                return toMemberExpression(
                                    ev.role,
                                    toMemberExpression(
                                        ev.event,
                                        field.value as string
                                    )
                                )
                            }
                            case "shadow": {
                                const field = inputs[0].fields["value"]
                                const { value } = field
                                return <jsep.Literal>{
                                    type: "Literal",
                                    value: value,
                                    raw: value + "",
                                }
                            }
                            default: {
                                console.warn(
                                    `unsupported block template ${template} for ${type}`,
                                    { ev, block }
                                )
                                break
                            }
                        }
                        break
                    }
                }
            }
            throw new EmptyExpression()
        }
        return {
            expr: blockToExpressionInner(ev, blockIn),
            errors,
        }
    }

    type CmdWithErrors = {
        cmd: VMBase
        errors: VMError[]
    }

    const makeWait = (event: RoleEvent, block: BlockJSON) => {
        const { inputs } = block
        {
            const { expr: time, errors } = blockToExpression(
                event,
                inputs[0].child
            )
            return {
                cmd: makeVMBase(block, {
                    type: "CallExpression",
                    arguments: [time],
                    callee: toIdentifier("wait"),
                }),
                errors: processErrors(block, errors),
            }
        }
    }

    const blockToCommand = (
        event: RoleEvent,
        block: BlockJSON
    ): CmdWithErrors => {
        const { type, inputs } = block
        switch (type) {
            case WAIT_BLOCK:
                return makeWait(event, block)
            case "dynamic_if": {
                const thenHandler: VMHandler = {
                    commands: [],
                    errors: [],
                }
                const elseHandler: VMHandler = {
                    commands: [],
                    errors: [],
                }
                const t = inputs[1]?.child
                const e = inputs[2]?.child
                if (t) {
                    addCommands(
                        event,
                        [t, ...(t.children ? t.children : [])],
                        thenHandler
                    )
                }
                if (e) {
                    addCommands(
                        event,
                        [e, ...(e.children ? e.children : [])],
                        elseHandler
                    )
                }
                let exprErrors: ExpressionWithErrors = undefined
                try {
                    exprErrors = blockToExpression(event, inputs[0]?.child)
                } catch (e) {
                    if (e instanceof EmptyExpression) {
                        exprErrors = {
                            expr: {
                                type: "Literal",
                                value: false,
                                raw: "false ",
                            } as jsep.Literal,
                            errors: [],
                        }
                    } else {
                        throw e
                    }
                }
                const { expr, errors } = exprErrors

                const ifThenElse: VMIfThenElse = {
                    sourceId: block.id,
                    type: "ite",
                    expr,
                    then: thenHandler.commands,
                    else: elseHandler.commands,
                }
                return {
                    cmd: ifThenElse,
                    errors: processErrors(
                        block,
                        errors
                            .concat(thenHandler.errors)
                            .concat(elseHandler.errors)
                    ),
                }
            }
            // more builts
            default: {
                const def = resolveServiceBlockDefinition(type)
                if (def) {
                    const { template } = def
                    switch (template) {
                        case "register_set": {
                            const { register } = def as RegisterBlockDefinition
                            const { expr, errors } = blockToExpression(
                                event,
                                inputs[0].child
                            )
                            const { value: role } = inputs[0].fields.role
                            return {
                                cmd: makeVMBase(block, {
                                    type: "CallExpression",
                                    arguments: [
                                        toMemberExpression(
                                            role as string,
                                            register.name
                                        ),
                                        expr,
                                    ],
                                    callee: toIdentifier("writeRegister"),
                                }),
                                errors: processErrors(block, errors),
                            }
                        }
                        case "command": {
                            const { command: serviceCommand } =
                                def as CommandBlockDefinition
                            const { value: role } = inputs[0].fields.role
                            const exprsErrors = inputs.map(a =>
                                blockToExpression(event, a.child)
                            )
                            return {
                                cmd: makeVMBase(block, {
                                    type: "CallExpression",
                                    arguments: exprsErrors.map(p => p.expr),
                                    callee: toMemberExpression(
                                        role as string,
                                        serviceCommand.name
                                    ),
                                }),
                                errors: processErrors(
                                    block,
                                    exprsErrors.flatMap(p => p.errors)
                                ),
                            }
                        }
                        default: {
                            console.warn(
                                `unsupported block template ${template} for ${type}`,
                                { block }
                            )
                            return {
                                cmd: undefined,
                                errors: [],
                            }
                        }
                    }
                }
            }
        }
    }

    const nop = {
        type: "CallExpression",
        arguments: [],
        callee: toIdentifier("nop"),
    } as jsep.CallExpression

    const addCommands = (
        event: RoleEvent,
        blocks: BlockJSON[],
        handler: VMHandler
    ) => {
        blocks?.forEach(child => {
            if (child) {
                try {
                    const { cmd, errors } = blockToCommand(event, child)
                    if (cmd) handler.commands.push(cmd)
                    errors.forEach(e => handler.errors.push(e))
                } catch (e) {
                    if (e instanceof EmptyExpression) {
                        handler.commands.push({
                            sourceId: child.id,
                            type: "cmd",
                            command: nop,
                        } as VMBase)
                    }
                }
            }
        })
    }

    const handlers: VMHandler[] = workspace.blocks
        .map(top => {
            const { type } = top
            let command: jsep.CallExpression = undefined
            let topEvent: RoleEvent = undefined
            let topErrors: VMError[] = []
            const definition = resolveServiceBlockDefinition(type)
            assert(!!definition)
            const { template, dsl: dslName } = definition
            const dsl = dslName && dsls?.find(d => d.id === dslName)

            try {
                if (dsl?.compileToVM) {
                    const { expression, errors, event } =
                        dsl?.compileToVM({
                            block: top,
                            definition,
                            blockToExpression,
                        }) || {}
                    command = expression as jsep.CallExpression
                    topErrors = errors
                    topEvent = event
                }

                // if dsl didn't compile anything try again
                if (!command && !topErrors?.length) {
                    switch (template) {
                        case "meta": {
                            break
                        }
                        default: {
                            console.warn(
                                `unsupported handler template ${template} for ${type}`,
                                { top }
                            )
                            break
                        }
                    }
                }
            } catch (e) {
                console.debug(e)
                if (e instanceof EmptyExpression) {
                    return undefined
                } else {
                    throw e
                }
            }

            // nothing to compile here
            if (!command && !topErrors?.length) return undefined

            const handler: VMHandler = {
                commands: [
                    {
                        sourceId: top.id,
                        type: "cmd",
                        command,
                    } as VMBase,
                ],
                errors: topErrors || [],
            }

            addCommands(topEvent, top.children, handler)
            return handler
        })
        .filter(handler => !!handler)

    return {
        roles,
        handlers,
    }
}
