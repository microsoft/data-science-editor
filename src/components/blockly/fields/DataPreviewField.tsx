import React, { lazy, ReactNode } from "react"
import ReactField, { ReactFieldJSON } from "./ReactField"
import {
    BlockDefinition,
    DataPreviewInputDefinition,
    identityTransformData,
} from "../toolbox"
import Suspense from "../../ui/Suspense"
const DataTablePreviewWidget = lazy(() => import("./DataTablePreviewWidget"))

export interface DataPreviewOptions extends ReactFieldJSON {
    compare?: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default class DataPreviewField extends ReactField<ReactFieldJSON> {
    static KEY = "jacdac_field_data_preview"
    compare: boolean

    static fromJson(options: DataPreviewOptions) {
        return new DataPreviewField(options?.value, undefined, options)
    }

    // the first argument is a dummy and never used
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(value: string, validator?: any, options?: DataPreviewOptions) {
        super(value, validator, options)
        this.compare = !!options?.compare
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
            <Suspense>
                <DataTablePreviewWidget compare={this.compare} />
            </Suspense>
        )
    }
}

export function addDataPreviewField(block: BlockDefinition): BlockDefinition {
    const preview = block?.dataPreviewField
    if (preview) {
        // don't add twice
        block.dataPreviewField = false
        // parse args and add one more arg
        const { message0 } = block
        const i = message0.lastIndexOf("%")
        const index = parseInt(message0.substr(i + 1)) || 0
        block.message0 += ` %${index + 1}`

        // does this mutate the data?
        const identity =
            preview === "after" || block.transformData === identityTransformData

        // add field
        block.args0.push({
            type: DataPreviewField.KEY,
            name: "preview",
            compare: !identity,
        } as DataPreviewInputDefinition)
    }
    return block
}
