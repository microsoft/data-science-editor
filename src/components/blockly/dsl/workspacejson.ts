export interface VariableJSON {
    // Boolean, Number, String, or service short id
    type: string
    id: string
    name: string
}

export type FieldJSON = {
    id?: string
    value?: number | string | boolean
    // Boolean, Number, String, or service short id
    variabletype?: string
    // and extra fields, subclass
}

export interface InputJSON {
    type: number
    name: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fields: Record<string, FieldJSON>
    child?: BlockJSON
}

export interface BlockJSON {
    type: string
    id: string
    children?: BlockJSON[]
    value?: string | number | boolean
    inputs?: InputJSON[]
    next?: BlockJSON
    warning?: string
}

export interface WorkspaceJSON {
    variables: VariableJSON[]
    blocks: BlockJSON[]
}

export interface WorkspaceFile {
    editor: string
    xml: string
    json: WorkspaceJSON
}
