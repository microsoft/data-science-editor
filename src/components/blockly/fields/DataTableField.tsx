import React from "react"
import { ReactFieldJSON } from "./ReactField"
import ReactInlineField from "./ReactInlineField"
import { DataTableWidget } from "./DataTableWidget"

const MAX_ITEMS = 256
export default class DataTableField extends ReactInlineField {
    static KEY = "jacdac_field_data_table"
    static EDITABLE = false

    static fromJson(options: ReactFieldJSON) {
        return new DataTableField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: any) {
        super(options)
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div")
        c.style.display = "block"
        c.style.minWidth = "388px"
        c.style.maxWidth = "80vh"
        c.style.maxHeight = "60vh"
        return c
    }

    renderInlineField() {
        return <DataTableWidget maxItems={MAX_ITEMS} />
    }
}
