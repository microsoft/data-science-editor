import React, { ReactNode } from "react"
import ReactField, { ReactFieldJSON } from "./ReactField"
import { DataTableWidget } from "./DataTableWidget"
import { BlockDefinition } from "../toolbox"

const MAX_ITEMS = 64

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class DataPreviewField extends ReactField<ReactFieldJSON> {
    static KEY = "jacdac_field_data_preview"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new DataPreviewField(options?.value, undefined, options)
    }

    protected initCustomView(): SVGElement {
        const group = this.fieldGroup_
        group.classList.add("blocklyFieldButton")
        return undefined
    }

    getText_() {
        return "👀"
    }

    renderField(): ReactNode {
        return (
            <DataTableWidget
                tableHeight={295}
                empty={"no data"}
                transformed={true}
                maxItems={MAX_ITEMS}
            />
        )
    }
}

export function addDataPreviewField(block: BlockDefinition): BlockDefinition {
    if (block?.dataPreviewField) {
        // don't add twice
        block.dataPreviewField = false
        // parse args and add one more arg
        const { message0 } = block
        const i = message0.lastIndexOf("%")
        const index = parseInt(message0.substr(i + 1))
        block.message0 += ` %${index + 1}`
        // add field
        block.args0.push({
            type: DataPreviewField.KEY,
            name: "preview",
        })
    }
    return block
}
