import { BlockJSON, WorkspaceJSON } from "./jsongenerator"
import {
    IT4Base,
    IT4Handler,
    IT4Program,
    IT4Role,
    toMemberExpression,
    toIdentifier,
    IT4IfThenElse,
} from "../../../jacdac-ts/src/vm/ir"
import { BUILTIN_TYPES } from "./useToolbox"
import { assert } from "../../../jacdac-ts/src/jdom/utils"
import {
    BlockDefinition,
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

type RoleEvent = {
    role: string
    event: string
}

export default function workspaceJSONToIT4Program(
    serviceBlocks: BlockDefinition[],
    workspace: WorkspaceJSON
): IT4Program {
    console.debug(`compile it4`, { workspace })

    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortId: v.type }))

    const blockToExpression: (
        ev: RoleEvent,
        block: BlockJSON
    ) => jsep.Expression = (ev: RoleEvent, block: BlockJSON) => {
        if (!block) return toIdentifier("%%NOCODE%%")
        const { type, value, inputs } = block
        console.log(`block2e`, { ev, block, type, value, inputs })

        console.debug(`block`, type, value, inputs)

        if (value !== undefined)
            // literal
            return <jsep.Literal>{
                type: "Literal",
                value: value,
                raw: value + "",
            }

        switch (type) {
            case "jacdac_math_single": {
                const argument = blockToExpression(ev, inputs[0].child)
                const op = inputs[0].fields["op"].value as string
                return <jsep.UnaryExpression>{
                    type: "UnaryExpression",
                    operator: ops[op] || op,
                    argument,
                    prefix: false, // TODO:?
                }
            }
            case "jacdac_math_arithmetic": {
                const left = blockToExpression(ev, inputs[0].child)
                const right = blockToExpression(ev, inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return <jsep.BinaryExpression>{
                    type: "BinaryExpression",
                    operator: ops[op] || op,
                    left,
                    right,
                }
            }
            case "logic_operation": {
                const left = blockToExpression(ev, inputs[0].child)
                const right = blockToExpression(ev, inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return <jsep.LogicalExpression>{
                    type: "LogicalExpression",
                    operator: ops[op] || op,
                    left,
                    right,
                }
            }
            case "logic_negate": {
                const argument = blockToExpression(ev, inputs[0].child)
                return <jsep.UnaryExpression>{
                    type: "UnaryExpression",
                    operator: "!",
                    argument,
                    prefix: false, // TODO:?
                }
            }
            case "logic_compare": {
                const left = blockToExpression(ev, inputs[0].child)
                const right = blockToExpression(ev, inputs[1].child)
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
                }
                if (def) {
                    const { template } = def
                    console.log("get", { type, def, template })
                    switch (template) {
                        case "register_get": {
                            const { register } = def as RegisterBlockDefinition
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
                            if (ev.event !== event.identifierName) {
                                // TODO: we need to raise an error to the user in Blockly
                                // TODO: the field that they referenced in the block
                                // TODO: doesn't belong to the event that fired
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
        return toIdentifier("%%NOCODE%%")
    }

    const blockToCommand = (event: RoleEvent, block: BlockJSON): IT4Base => {
        let command: jsep.CallExpression
        const { type, inputs } = block
        switch (type) {
            case WAIT_BLOCK: {
                const time = blockToExpression(event, inputs[0].child)
                command = {
                    type: "CallExpression",
                    arguments: [time],
                    callee: toIdentifier("wait"),
                }
                break
            }
            case "dynamic_if": {
                const ret: IT4IfThenElse = {
                    sourceId: block.id,
                    type: "ite",
                    expr: blockToExpression(event, inputs[0]?.child),
                    then: [],
                    else: [],
                }
                const t = inputs[1]?.child
                const e = inputs[2]?.child
                if (t)
                    addCommands(event, ret.then, [
                        t,
                        ...(t.children ? t.children : []),
                    ])
                if (e)
                    addCommands(event, ret.else, [
                        e,
                        ...(e.children ? e.children : []),
                    ])
                return ret
            }
            // more builts
            default: {
                const def = resolveServiceBlockDefinition(type)
                if (def) {
                    const { template } = def
                    switch (template) {
                        case "register_set": {
                            const { register } = def as RegisterBlockDefinition
                            const val = blockToExpression(
                                event,
                                inputs[0].child
                            )
                            const { value: role } = inputs[0].fields.role
                            command = {
                                type: "CallExpression",
                                arguments: [
                                    toMemberExpression(
                                        role as string,
                                        register.name
                                    ),
                                    val,
                                ],
                                callee: toIdentifier("writeRegister"),
                            }
                            break
                        }
                        case "command": {
                            const { command: serviceCommand } =
                                def as CommandBlockDefinition
                            const { value: role } = inputs[0].fields.role
                            command = {
                                type: "CallExpression",
                                arguments: inputs.map(a =>
                                    blockToExpression(event, a.child)
                                ),
                                callee: toMemberExpression(
                                    role as string,
                                    serviceCommand.name
                                ),
                            }
                            break
                        }
                        default: {
                            console.warn(
                                `unsupported command template ${template} for ${type}`,
                                { event, block }
                            )
                            break
                        }
                    }
                }
            }
        }
        // for linking back
        return {
            sourceId: block.id,
            type: "cmd",
            command,
        } as IT4Base
    }

    const addCommands = (
        event: RoleEvent,
        acc: IT4Base[],
        blocks: BlockJSON[]
    ) => {
        blocks?.forEach(child => {
            if (child) acc.push(blockToCommand(event, child))
        })
    }

    const handlers: IT4Handler[] = workspace.blocks.map(top => {
        const { type, inputs } = top
        const commands: IT4Base[] = []
        let command: jsep.CallExpression = undefined
        let topEvent: RoleEvent = undefined
        if (type === WHILE_CONDITION_BLOCK) {
            // this is while (...)
            const { child: condition } = inputs[0]
            command = {
                type: "CallExpression",
                arguments: [blockToExpression(undefined, condition)],
                callee: toIdentifier("awaitCondition"),
            }
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
                    const argument = blockToExpression(
                        undefined,
                        inputs[0].child
                    )
                    command = {
                        type: "CallExpression",
                        arguments: [
                            toMemberExpression(role.toString(), register.name),
                            argument,
                        ],
                        callee: toIdentifier("awaitChange"),
                    }
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

        commands.push({
            sourceId: top.id,
            type: "cmd",
            command,
        } as IT4Base)

        addCommands(topEvent, commands, top.children)

        return {
            commands,
        }
    })

    return {
        roles,
        handlers,
    }
}
