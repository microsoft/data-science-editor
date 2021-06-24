import { BlockJSON, FieldJSON, InputJSON, WorkspaceJSON } from "./jsongenerator"

export interface WorkspaceVisitor {
    visitBlock?: (block: BlockJSON) => void
    visitInput?: (input: InputJSON) => void
    visitField?: (name: string, field: FieldJSON) => void
}

export function visitBlock(block: BlockJSON, visitor: WorkspaceVisitor) {
    if (!block) return
    visitor.visitBlock?.(block)
    const { inputs, children } = block
    inputs?.forEach(input => visitInput(input, visitor))
    children?.forEach(child => visitBlock(child, visitor))
}

export function visitInput(input: InputJSON, visitor: WorkspaceVisitor) {
    if (!input) return
    visitor.visitInput?.(input)
    const { fields, child } = input
    if (fields) Object.keys(fields).map(k => visitField(k, fields[k], visitor))
    visitBlock(child, visitor)
}

export function visitField(
    name: string,
    field: FieldJSON,
    visitor: WorkspaceVisitor
) {
    if (!field) return
    visitor.visitField?.(name, field)
}

export function visitWorkspace(
    workspace: WorkspaceJSON,
    visitor: WorkspaceVisitor
) {
    workspace?.blocks?.forEach(block => visitBlock(block, visitor))
}
