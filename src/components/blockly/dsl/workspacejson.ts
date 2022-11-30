import { VMProgram } from "../../devicescript/vm/ir"
import { JacscriptProgram } from "../../devicescript/vm/ir2jacscript"
import { tidyHeaders } from "../fields/tidy"
import { BlockDataSet } from "../toolbox"

export interface VariableJSON {
    // Boolean, Number, String, or service short id
    type: string
    id: string
    name: string
}

export type FieldJSON = {
    id?: string
    value?: number | string | boolean | any
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

export function getField(block: BlockJSON, name: string): FieldJSON {
    const inputs = block.inputs
    for (let i = 0; i < inputs.length; ++i) {
        const field = inputs[i].fields[name]
        if (field) return field
    }
    return undefined
}

export function getFieldValue(block: BlockJSON, name: string) {
    const field = getField(block, name)
    return field?.value
}

export function resolveFieldColumn(
    data: BlockDataSet,
    b: BlockJSON,
    fieldName: string,
    options?: {
        type?: "string" | "number" | "boolean"
        required?: boolean
    }
): { column: string; warning?: string } {
    const name = getFieldValue(b, fieldName) as string
    const { type, required } = options || {}
    const column = resolveHeader(data, name, type)
    let warning: string
    if (!column) {
        if (required && !name) warning = "missing column"
        else if (name) warning = `${name} column not found`
    }
    return { column, warning }
}

export function resolveHeader(
    data: BlockDataSet,
    name: string,
    type?: "string" | "number" | "boolean"
) {
    if (!data || !name) return undefined

    const { headers } = tidyHeaders(data, type)
    return headers.indexOf(name) > -1 ? name : undefined
}

export interface WorkspaceJSON {
    variables: VariableJSON[]
    blocks: BlockJSON[]
}

export interface WorkspaceFile {
    editor: string
    xml: string
    json: WorkspaceJSON
    vm?: VMProgram
    jsc?: JacscriptProgram
}
