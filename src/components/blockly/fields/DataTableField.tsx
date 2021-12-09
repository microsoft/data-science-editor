import React from "react"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import DataTableWidget from "./DataTableWidget"
import { SMALL_TABLE_HEIGHT } from "../toolbox"

export interface DataPreviewOptions extends ReactFieldJSON {
    transformed?: boolean
    small?: boolean
    selectColumns?: boolean
}

const MAX_ITEMS = 256
export default class DataTableField extends ReactInlineField {
    static KEY = "jacdac_field_data_table"
    EDITABLE = false
    transformed: boolean
    small: boolean
    selectColumns: boolean

    static fromJson(options: DataPreviewOptions) {
        return new DataTableField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: DataPreviewOptions) {
        super(options)
        this.transformed = !!options?.transformed
        this.small = !!options?.small
        this.selectColumns = !!options?.selectColumns
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "block"
        c.style.minWidth = "388px"
        c.style.maxWidth = "80vh"
        c.style.maxHeight = "60vh"
        c.style.overflow = "auto"
        return c
    }

    renderInlineField() {
        const tableHeight = this.small ? SMALL_TABLE_HEIGHT : undefined
        return (
            <DataTableWidget
                maxItems={MAX_ITEMS}
                tableHeight={tableHeight}
                transformed={this.transformed}
                selectColumns={this.selectColumns}
            />
        )
    }
}
