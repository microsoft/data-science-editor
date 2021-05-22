import {
    BlockJSON,
    FieldJSON,
    visitWorkspace,
    WorkspaceJSON,
} from "./jsongenerator"
import {
    IT4GuardedCommand,
    IT4Handler,
    IT4Program,
    IT4Role,
} from "../../../jacdac-ts/src/vm/ir"
import { BUILTIN_TYPES, loadBlocks, WHILE_CONDITION_BLOCK } from "./useToolbox"

const ops = {
    AND: "&&",
    OR: "||",
    EQ: "===",
    NEQ: "!==",
    LT: "<",
    GT: ">",
    LTE: "<=",
    GTE: ">=",
}

function blockToExpression(block: BlockJSON) {
    if (!block) return undefined
    const { type, value, inputs } = block
    if (value !== undefined)
        // literal
        return <jsep.Literal>{
            type: "Literal",
            value: value,
            raw: value + "",
        }

    console.log(`block`, block)
    switch (type) {
        case "logic_operation": {
            const left = blockToExpression(inputs[0].child)
            const right = blockToExpression(inputs[1].child)
            const op = inputs[1].fields["op"].value as string
            return <jsep.LogicalExpression>{
                type: "LogicalExpression",
                left,
                right,
                operator: ops[op] || op,
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
                left,
                right,
                operator: ops[op] || op,
            }
        }
    }
    return undefined
}

export default function workspaceJSONToIT4Program(
    workspace: WorkspaceJSON
): IT4Program {
    console.debug(`compile it4`, { workspace })

    const { blocks } = loadBlocks()
    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortName: v.type }))

    // visit all the nodes in the blockly tree
    const registers: string[] = []
    const events: string[] = []

    // collect registers and events
    visitWorkspace(workspace, {
        visitBlock: b => {
            const def =
                /^jacdac_/.test(b.type) && blocks.find(d => d.type === b.type)
            if (!def) return
            const { service, register, events: defEvents } = def
            if (register) registers.push(`${service.shortId}.${register.name}`)
            if (defEvents)
                for (const event of defEvents)
                    events.push(`${service.shortId}.${event.name}`)
        },
    })

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
                    callee: undefined,
                },
            })
        } else {
            const def = blocks.find(def => def.type === type) as {
                service: jdspec.ServiceSpec
                events: jdspec.PacketInfo[]
            }
            const { service, events } = def
            console.log("event", { service, events, def })
        }
        return {
            description: type,
            commands,
        }
    })

    return {
        description: "not required?",
        roles,
        registers,
        events,
        handlers,
    }
}
