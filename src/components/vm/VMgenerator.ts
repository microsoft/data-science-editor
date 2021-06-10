import { BlockJSON, WorkspaceJSON } from "../blockly/jsongenerator"
import {
    VMBase,
    VMHandler,
    VMProgram,
    VMRole,
    VMIfThenElse,
    VMError,
} from "../../../jacdac-ts/src/vm/ir"
import { toIdentifier, RoleEvent } from "../../../jacdac-ts/src/vm/compile"

import { assert } from "../../../jacdac-ts/src/jdom/utils"
import {
    BUILTIN_TYPES,
    resolveServiceBlockDefinition,
} from "../blockly/toolbox"
import Blockly from "blockly"
import BlockDomainSpecificLanguage from "../blockly/dsl/dsl"

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

export interface CmdWithErrors {
    cmd: VMBase
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

    if (!workspace) return undefined

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
                case "math_single": // built-in blockly
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
                case "math_arithmetic": // built-in blockly
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
                    const definition = resolveServiceBlockDefinition(type)
                    if (!definition) {
                        console.warn(`unknown block ${type}`, {
                            type,
                            ev,
                            block,
                            d: Blockly.Blocks[type],
                        })
                    } else {
                        // try any DSL
                        const { dsl: dslName } = definition
                        const dsl = dsls.find(d => d.id === dslName)
                        const res = dsl?.compileExpressionToVM?.({
                            event: ev,
                            definition,
                            block,
                            blockToExpressionInner,
                        })
                        if (res) {
                            if (res.errors)
                                res.errors.forEach(e => errors.push(e))
                            return res.expr
                        }

                        const { template } = definition
                        switch (template) {
                            case "shadow": {
                                const field = inputs[0].fields["value"]
                                const v = field.value
                                return <jsep.Literal>{
                                    type: "Literal",
                                    value: v,
                                    raw: v + "",
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

    const blockToCommand = (
        event: RoleEvent,
        block: BlockJSON
    ): CmdWithErrors => {
        const { type, inputs } = block
        console.debug(`block2c`, { event, type, block, inputs })
        switch (type) {
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
                const definition = resolveServiceBlockDefinition(type)
                if (definition) {
                    const { dsl: dslName } = definition
                    const dsl = dsls.find(dsl => dsl.id === dslName)
                    const dslRes = dsl?.compileCommandToVM?.({
                        event,
                        block,
                        definition,
                        blockToExpression,
                    })
                    if (dslRes) {
                        dslRes.errors = processErrors(block, dslRes.errors)
                        return dslRes
                    }
                }
                console.warn(`unsupported block ${type}`, { block })
                return {
                    cmd: undefined,
                    errors: [],
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
                    } else {
                        console.debug(e)
                    }
                }
            }
        })
    }

    const handlers: VMHandler[] = workspace.blocks
        .map(top => {
            const { type } = top
            let command: jsep.CallExpression
            let topEvent: RoleEvent
            let topErrors: VMError[]
            let topMeta = false
            const definition = resolveServiceBlockDefinition(type)
            assert(!!definition)
            const { template, dsl: dslName } = definition
            const dsl = dslName && dsls?.find(d => d.id === dslName)

            try {
                const { expression, errors, event, meta } =
                    dsl?.compileEventToVM?.({
                        block: top,
                        definition,
                        blockToExpression,
                    }) || {}
                command = expression as jsep.CallExpression
                topErrors = errors
                topEvent = event
                topMeta = meta

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
                meta: !!topMeta,
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
