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
import {
    BlockDefinition,
    BUILTIN_TYPES,
    CommandBlockDefinition,
    RegisterBlockDefinition,
    WAIT_BLOCK,
    WHILE_CONDITION_BLOCK,
} from "./useToolbox"
import { assert } from "../../../jacdac-ts/src/jdom/utils"

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
    MUL: "*",
    DIV: "/",
    MINUS: "-",
}

export default function workspaceJSONToIT4Program(
    serviceBlocks: BlockDefinition[],
    workspace: WorkspaceJSON
): IT4Program {
    console.debug(`compile it4`, { workspace })

    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortId: v.type }))

    const blockToExpression: (block: BlockJSON) => jsep.Expression = (
        block: BlockJSON
    ) => {
        if (!block) return toIdentifier("%%NOCODE%%")
        const { type, value, inputs } = block

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
                const argument = blockToExpression(inputs[0].child)
                const op = inputs[0].fields["op"].value as string
                return <jsep.UnaryExpression>{
                    type: "UnaryExpression",
                    operator: ops[op] || op,
                    argument,
                    prefix: false, // TODO:?
                }
            }
            case "jacdac_math_arithmetic": {
                const left = blockToExpression(inputs[0].child)
                const right = blockToExpression(inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return <jsep.BinaryExpression>{
                    type: "BinaryExpression",
                    operator: ops[op] || op,
                    left,
                    right,
                }
            }
            case "logic_operation": {
                const left = blockToExpression(inputs[0].child)
                const right = blockToExpression(inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return <jsep.LogicalExpression>{
                    type: "LogicalExpression",
                    operator: ops[op] || op,
                    left,
                    right,
                }
            }
            case "logic_negate": {
                const argument = blockToExpression(inputs[0].child)
                return <jsep.UnaryExpression>{
                    type: "UnaryExpression",
                    operator: "!",
                    argument,
                    prefix: false, // TODO:?
                }
            }
            case "logic_compare": {
                const left = blockToExpression(inputs[0].child)
                const right = blockToExpression(inputs[1].child)
                const op = inputs[1].fields["op"].value as string
                return <jsep.BinaryExpression>{
                    type: "BinaryExpression",
                    operator: ops[op] || op,
                    left,
                    right,
                }
            }
            default: {
                const def = serviceBlocks.find(def => def.type === type)
                if (def) {
                    const { template } = def
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
                    }
                    break
                }
            }
        }
        return toIdentifier("%%NOCODE%%")
    }

    const blockToCommand = (block: BlockJSON): IT4Base => {
        let command: jsep.CallExpression
        const { type, inputs } = block
        switch (type) {
            case WAIT_BLOCK: {
                const time = blockToExpression(inputs[0].child)
                command = {
                    type: "CallExpression",
                    arguments: [time],
                    callee: toIdentifier("wait"),
                }
                break
            }
            case "dynamic_if": {
                let ret: IT4IfThenElse = {
                    sourceId: block.id,
                    type: "ite",
                    expr: blockToExpression(inputs[0]?.child),
                    then: [],
                    else: [],
                }
                const t = inputs[1]?.child
                const e = inputs[2]?.child
                if (t) addCommands(ret.then, [ t, ...(t.children ? t.children : [])])
                if (e) addCommands(ret.else, [ e, ...(e.children ? e.children : [])])
                return ret
            }
            // more builts
            default: {
                const def = serviceBlocks.find(def => def.type === type)
                if (def) {
                    const { template } = def
                    switch (template) {
                        case "register_set": {
                            const { register } = def as RegisterBlockDefinition
                            const val = blockToExpression(inputs[0].child)
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
                                    blockToExpression(a.child)
                                ),
                                callee: toMemberExpression(
                                    role as string,
                                    serviceCommand.name
                                ),
                            }
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

    const addCommands = (acc: IT4Base[], blocks: BlockJSON[]) => {
        blocks?.forEach(child => {
            if (child) acc.push(blockToCommand(child))
        })
    }

    const handlers: IT4Handler[] = workspace.blocks.map(top => {
        const { type, inputs } = top
        const commands: IT4Base[] = []
        let command: jsep.CallExpression = undefined
        if (type === WHILE_CONDITION_BLOCK) {
            // this is while (...)
            const { child: condition } = inputs[0]
            command = {
                type: "CallExpression",
                arguments: [blockToExpression(condition)],
                callee: toIdentifier("awaitCondition"),
            }
        } else {
            const def = serviceBlocks.find(def => def.type === type)
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
                    break
                }
                case "register_change_event": {
                    const { register } = def as RegisterBlockDefinition
                    const argument = blockToExpression(inputs[0].child)
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
            }
        }

        commands.push({
            sourceId: top.id,
            type: "cmd",
            command,
        } as IT4Base)

        addCommands(commands, top.children)

        return {
            commands,
        }
    })

    return {
        roles,
        handlers,
    }
}
