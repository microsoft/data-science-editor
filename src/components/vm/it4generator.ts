import { BlockJSON, WorkspaceJSON } from "./jsongenerator"
import {
    IT4GuardedCommand,
    IT4Handler,
    IT4Program,
    IT4Role,
} from "../../../jacdac-ts/src/vm/ir"
import {
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
}

function toIdentifier(id: string) {
    return {
        type: "Identifier",
        name: id,
    } as jsep.Identifier
}

function toMemberExpression(root: string, field: string | jsep.Expression) {
    return {
        type: "MemberExpression",
        object: toIdentifier(root),
        property: typeof field === "string" ? toIdentifier(field) : field,
        computed: false,
    } as jsep.MemberExpression
}

export default function workspaceJSONToIT4Program(
    workspace: WorkspaceJSON
): IT4Program {
    console.debug(`compile it4`, { workspace })

    const { serviceBlocks } = loadBlocks()
    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortName: v.type }))

    const blockToExpression = (block: BlockJSON) => {
        if (!block) return undefined
        const { type, value, inputs } = block

        console.log(`block`, type, value, inputs)

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
        return undefined
    }

    const blockToCommand = (block: BlockJSON): IT4GuardedCommand => {
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

        return {
            command,
        }
    }

    const handlers: IT4Handler[] = workspace.blocks.map(top => {
        const { type, inputs } = top
        const commands: IT4GuardedCommand[] = []
        if (type === WHILE_CONDITION_BLOCK) {
            // this is while (...)
            const { child: condition } = inputs[0]
            commands.push({
                command: {
                    type: "CallExpression",
                    arguments: [blockToExpression(condition)],
                    callee: toIdentifier("awaitCondition"),
                },
            })
        } else {
            const def = serviceBlocks.find(def => def.type === type)
            assert(!!def)
            const { template } = def
            switch (template) {
                case "event": {
                    const { value: role } = inputs[0].fields["role"]
                    const { value: eventName } = inputs[0].fields["event"]
                    commands.push({
                        command: {
                            type: "CallExpression",
                            arguments: [
                                toMemberExpression(
                                    role.toString(),
                                    eventName.toString()
                                ),
                            ],
                            callee: toIdentifier("awaitEvent"),
                        },
                    })
                    // TODO
                    break
                }
                case "register_change_event": {
                    const { service, register } = def as RegisterBlockDefinition
                    // TODO
                    break
                }
            }
        }

        // process children
        top.children?.forEach(child => commands.push(blockToCommand(child)))

        return {
            commands,
        }
    })

    return {
        roles,
        handlers,
    }
}
