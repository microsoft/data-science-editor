import { BlockJSON, WorkspaceJSON } from "./jsongenerator"
import {
    IT4Base,
    IT4Handler,
    IT4Program,
    IT4Role,
    toMemberExpression,
    toIdentifier,
    IT4IfThenElse,
    RoleEvent,
    IT4Error,
} from "../../../jacdac-ts/src/vm/ir"
import { assert } from "../../../jacdac-ts/src/jdom/utils"
import {
    CommandBlockDefinition,
    EventFieldDefinition,
    RegisterBlockDefinition,
    resolveServiceBlockDefinition,
    WAIT_BLOCK,
    WHILE_CONDITION_BLOCK,
} from "./toolbox"
import Blockly from "blockly"

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

const BUILTIN_TYPES = ["", "Boolean", "Number", "String"]

export default function workspaceJSONToIT4Program(
    workspace: WorkspaceJSON
): IT4Program {
    console.debug(`compile it4`, { workspace })

    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortId: v.type }))

    type ExpressionWithErrors = {
        expr: jsep.Expression
        errors: IT4Error[]
    }

    const blockToExpression: (
        ev: RoleEvent,
        block: BlockJSON
    ) => ExpressionWithErrors = (ev: RoleEvent, blockIn: BlockJSON) => {
        const errors: IT4Error[] = []

        const blockToExpressionInner = (ev: RoleEvent, block: BlockJSON) => {
            if (!block) {
                errors.push({
                    sourceId: blockIn?.id,
                    message: `Incomplete code under this block.`,
                })
                return toIdentifier("%%NOCODE%%")
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
            errors.push({
                sourceId: block.id,
                message: `Incomplete code.`,
            })
            return toIdentifier("%%NOCODE%%")
        }
        return {
            expr: blockToExpressionInner(ev, blockIn),
            errors,
        }
    }

    type CmdWithErrors = {
        cmd: IT4Base
        errors: IT4Error[]
    }

    const blockToCommand = (
        event: RoleEvent,
        block: BlockJSON
    ): CmdWithErrors => {
        const makeIT4Base = (command: jsep.CallExpression) => {
            return {
                sourceId: block.id,
                type: "cmd",
                command,
            } as IT4Base
        }
        const processErrors = (errors: IT4Error[]) => {
            return errors.map((e: IT4Error) => {
                return {
                    sourceId: e.sourceId ? e.sourceId : block.id,
                    message: e.message,
                }
            })
        }

        const { type, inputs } = block
        switch (type) {
            case WAIT_BLOCK: {
                const { expr: time, errors } = blockToExpression(
                    event,
                    inputs[0].child
                )
                return {
                    cmd: makeIT4Base({
                        type: "CallExpression",
                        arguments: [time],
                        callee: toIdentifier("wait"),
                    }),
                    errors: processErrors(errors),
                }
            }
            case "dynamic_if": {
                const { expr, errors } = blockToExpression(
                    event,
                    inputs[0]?.child
                )
                const thenHandler: IT4Handler = {
                    commands: [],
                    errors: [],
                }
                const elseHandler: IT4Handler = {
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
                const ifThenElse: IT4IfThenElse = {
                    sourceId: block.id,
                    type: "ite",
                    expr,
                    then: thenHandler.commands,
                    else: elseHandler.commands,
                }
                return {
                    cmd: ifThenElse,
                    errors: processErrors(
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
                                cmd: makeIT4Base({
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
                                errors: processErrors(errors),
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
                                cmd: makeIT4Base({
                                    type: "CallExpression",
                                    arguments: exprsErrors.map(p => p.expr),
                                    callee: toMemberExpression(
                                        role as string,
                                        serviceCommand.name
                                    ),
                                }),
                                errors: processErrors(
                                    exprsErrors.flatMap(p => p.errors)
                                ),
                            }
                        }
                        default: {
                            return {
                                cmd: undefined,
                                errors: [
                                    {
                                        sourceId: block.id,
                                        message: `unsupported command template ${template} for ${type}`,
                                    },
                                ],
                            }
                        }
                    }
                }
            }
        }
    }

    const addCommands = (
        event: RoleEvent,
        blocks: BlockJSON[],
        handler: IT4Handler
    ) => {
        blocks?.forEach(child => {
            if (child) {
                const { cmd, errors } = blockToCommand(event, child)
                if (cmd) handler.commands.push(cmd)
                errors.forEach(e => handler.errors.push(e))
            }
        })
    }

    const handlers: IT4Handler[] = workspace.blocks.map(top => {
        const { type, inputs } = top
        let command: jsep.CallExpression = undefined
        let topEvent: RoleEvent = undefined
        let topErrors: IT4Error[] = []
        if (type === WHILE_CONDITION_BLOCK) {
            // this is while (...)
            const { child: condition } = inputs[0]
            const { expr, errors } = blockToExpression(undefined, condition)
            command = {
                type: "CallExpression",
                arguments: [expr],
                callee: toIdentifier("awaitCondition"),
            }
            topErrors = errors
        } else {
            const def = resolveServiceBlockDefinition(type)
            assert(!!def)
            const { template } = def
            const { value: role } = inputs[0].fields["role"]
            switch (template) {
                case "twin":
                    break // ignore
                case "event": {
                    const { value: eventName } = inputs[0].fields["event"]
                    command = {
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(
                                role.toString(),
                                eventName.toString()
                            ),
                        ],
                        callee: toIdentifier("awaitEvent"),
                    }
                    topEvent = {
                        role: role.toString(),
                        event: eventName.toString(),
                    }
                    break
                }
                case "register_change_event": {
                    const { register } = def as RegisterBlockDefinition
                    const { expr, errors } = blockToExpression(
                        undefined,
                        inputs[0].child
                    )
                    command = {
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(role.toString(), register.name),
                            expr,
                        ],
                        callee: toIdentifier("awaitChange"),
                    }
                    topErrors = errors
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

        const handler: IT4Handler = {
            commands: [
                {
                    sourceId: top.id,
                    type: "cmd",
                    command,
                } as IT4Base,
            ],
            errors: topErrors,
        }

        addCommands(topEvent, top.children, handler)

        return handler
    })

    return {
        roles,
        handlers,
    }
}
