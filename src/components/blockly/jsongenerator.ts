import Blockly from "blockly"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { SMap, toMap } from "../../../jacdac-ts/src/jdom/utils"

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
    fields: SMap<FieldJSON>
    child?: BlockJSON
}

export interface BlockJSON {
    type: string
    id: string
    children?: BlockJSON[]
    value?: string | number | boolean
    inputs?: InputJSON[]
    next?: BlockJSON
}

export interface WorkspaceJSON {
    variables: VariableJSON[]
    blocks: BlockJSON[]
}

export function domToJSON(workspace: Blockly.Workspace): WorkspaceJSON {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clean = (o: any) =>
        Object.keys(o)
            .filter(k => o[k] === undefined || o[k] === null)
            .forEach(k => delete o[k])
    const builtins: SMap<(block: Blockly.Block) => string | number | boolean> =
        {
            logic_null: () => null,
            text: block => block.getFieldValue("TEXT"),
            math_number: block => Number(block.getFieldValue("NUM") || "0"),
            logic_boolean: block => block.getFieldValue("BOOL") === "TRUE",
            jacdac_on_off: block => block.getFieldValue("value") === "on",
            jacdac_time_picker: block =>
                Number(block.getFieldValue("value") || "0"),
            jacdac_angle: block => Number(block.getFieldValue("value") || "0"),
            jacdac_percent: block =>
                Number(block.getFieldValue("value") || "0"),
            jacdac_ratio: block => Number(block.getFieldValue("value") || "0"),
        }

    const variableToJSON = (variable: Blockly.VariableModel): VariableJSON => ({
        name: variable.name,
        type: variable.type,
        id: variable.getId(),
    })
    const fieldsToJSON = (fields: Blockly.Field[]) =>
        !fields.length
            ? undefined
            : toMap(
                  fields,
                  field => (field.name as string)?.toLowerCase(),
                  fieldToJSON
              )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const xmlToJSON = (xml: Element): any => {
        const j = {}
        if (Flags.diagnostics) j["xml"] = xml.outerHTML
        // dump attributes
        for (const name of xml.getAttributeNames()) {
            const v = xml.getAttribute(name)
            j[name.toLowerCase()] = v
        }
        for (const child of xml.childNodes) {
            if (child.nodeType === Node.TEXT_NODE) j["value"] = xml.textContent
            else if (child.nodeType === Node.ELEMENT_NODE) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const children: any[] = j["children"] || (j["children"] = [])
                children.push(xmlToJSON(child as Element))
            }
        }
        return j
    }
    const fieldToJSON = (field: Blockly.Field) => {
        if (field.isSerializable()) {
            const container = Blockly.utils.xml.createElement("field")
            const fieldXml = field.toXml(container)
            return xmlToJSON(fieldXml)
        }
        return undefined
    }
    const flattenNext = (block: BlockJSON) => {
        // flatten the linked list of next into an array
        const children: BlockJSON[] = []
        let current = block.next
        while (current) {
            children.push(current)
            current = current.next
        }
        if (children.length) {
            block.children = children
            block.next = undefined
        }
    }
    const blockToJSON = (block: Blockly.Block): BlockJSON => {
        if (!block?.isEnabled()) return undefined
        // Skip over insertion markers.
        if (block.isInsertionMarker()) {
            const child = block.getChildren(false)[0]
            if (child) return blockToJSON(child)
            else return undefined
        }
        // dump object
        const value = builtins[block.type]?.(block)
        const element: BlockJSON = {
            type: block.type,
            id: block.id,
            value,
            inputs:
                value === undefined
                    ? block.inputList.map(input => {
                          const container: InputJSON = {
                              type: input.type,
                              name: input.name,
                              fields: fieldsToJSON(input.fieldRow),
                              child: blockToJSON(
                                  input.connection?.targetBlock()
                              ),
                          }
                          return container
                      })
                    : undefined,
            next: blockToJSON(block.getNextBlock()),
        }
        flattenNext(element)
        clean(element)
        return element
    }

    try {
        const variables = Blockly.Variables.allUsedVarModels(workspace)
        const blocks = workspace.getTopBlocks(true).filter(b => b.isEnabled())
        const json: WorkspaceJSON = {
            variables: variables.map(variableToJSON),
            blocks: blocks.map(blockToJSON),
        }
        return json
    } catch (e) {
        console.error(e)
        return undefined
    }
}
