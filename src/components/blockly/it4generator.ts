import { WorkspaceJSON } from "./JSONGenerator"
import { IT4Handler, IT4Program, IT4Role } from "../../../jacdac-ts/src/vm/ir"
import { BUILTIN_TYPES } from "./useToolbox"

export default function workspaceJSONToIT4Program(
    workspace: WorkspaceJSON
): IT4Program {
    const roles: IT4Role[] = workspace.variables
        .filter(v => BUILTIN_TYPES.indexOf(v.type) < 0)
        .map(v => ({ role: v.name, serviceShortName: v.type }))

    // collect registers and events
    // visit all the nodes in the blockly tree
    const registers: string[] = []
    const events: string[] = []
    const handlers: IT4Handler[] = []

    return {
        description: "not required?",
        roles,
        registers,
        events,
        handlers,
    }
}
