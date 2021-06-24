import { WorkspaceJSON } from "./jsongenerator"
import { visitWorkspace } from "./jsonvisitor"

export interface BlockWarning {
    sourceId?: string
    message: string
}

export function collectWarnings(workspace: WorkspaceJSON): BlockWarning[] {
    const warnings: BlockWarning[] = []
    visitWorkspace(workspace, {
        visitBlock: b => {
            if (b.warning) warnings.push({ sourceId: b.id, message: b.warning })
        },
    })
    return warnings
}
