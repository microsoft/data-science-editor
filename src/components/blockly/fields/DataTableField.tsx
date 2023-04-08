import React from "react";
import { ReactFieldJSON } from "./ReactField";
import ReactInlineField from "./ReactInlineField";
import DataTableWidget from "./DataTableWidget";
import { FULL_TABLE_WIDTH, SMALL_TABLE_HEIGHT, TABLE_WIDTH } from "../toolbox";

export interface DataPreviewOptions extends ReactFieldJSON {
    transformed?: boolean;
    small?: boolean;
    full?: boolean;
    selectColumns?: boolean;
    summary?: boolean;
}

const MAX_ITEMS = 256;
const FULL_MAX_ITEMS = 256 * 256;
export default class DataTableField extends ReactInlineField {
    static KEY = "ds_field_data_table";
    EDITABLE = false;
    transformed: boolean;
    small: boolean;
    selectColumns: boolean;
    full: boolean;
    summary: boolean;

    static fromJson(options: DataPreviewOptions) {
        return new DataTableField(options);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(options?: DataPreviewOptions) {
        super(options);
        this.transformed = !!options?.transformed;
        this.small = !!options?.small;
        this.selectColumns = !!options?.selectColumns;
        this.full = !!options?.full;
        this.summary = options?.summary !== false;
    }

    protected createContainer(): HTMLDivElement {
        const c = document.createElement("div");
        c.style.display = "block";
        c.style.minWidth = `${this.full ? FULL_TABLE_WIDTH : TABLE_WIDTH}px`;
        c.style.maxWidth = "80vw";
        c.style.maxHeight = "60vh";
        c.style.overflow = "auto";
        return c;
    }

    renderInlineField() {
        const tableHeight = this.small ? SMALL_TABLE_HEIGHT : undefined;
        const maxItems = this.full ? FULL_MAX_ITEMS : MAX_ITEMS;
        const tableWidth = this.full ? FULL_TABLE_WIDTH : undefined;
        return (
            <DataTableWidget
                maxItems={maxItems}
                tableHeight={tableHeight}
                tableWidth={tableWidth}
                transformed={this.transformed}
                selectColumns={this.selectColumns}
                hideSummary={!this.summary}
            />
        );
    }
}
