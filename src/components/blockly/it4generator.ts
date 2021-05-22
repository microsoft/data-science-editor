import { visit, WorkspaceJSON } from "./JSONGenerator"
import { IT4Handler, IT4Program, IT4Role } from "../../../jacdac-ts/src/vm/ir"
import { BUILTIN_TYPES, loadBlocks } from "./useToolbox"

export default function workspaceJSONToIT4Program(
    workspace: WorkspaceJSON
): IT4Program {
    const { blocks } = loadBlocks()
    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortName: v.type }))

    // visit all the nodes in the blockly tree
    const registers: string[] = []
    const events: string[] = []

    // collect registers and events
    visit(workspace, {
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

    const handlers: IT4Handler[] = []

    return {
        description: "not required?",
        roles,
        registers,
        events,
        handlers,
    }
}
