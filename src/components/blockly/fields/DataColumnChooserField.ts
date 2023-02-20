import { resolveBlockServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import { tidyHeaders, tidyResolveFieldColumn } from "./tidy"
import { Block, FieldDropdown } from "blockly"
import { humanify, unique } from "../../dom/utils"

export interface DataColumnChooseOptions extends ReactFieldJSON {
    dataType?: "number" | "string"
    parentData?: boolean | number
}

export interface DataColumnChooseDeclareOptions {
    prefix?: string
    start?: number
    dataType?: "string" | "boolean" | "number"
}

export function declareColumns(
    count: number,
    options?: DataColumnChooseDeclareOptions
) {
    const { prefix = "column", start = 1, dataType } = options || {}
    return Array(count)
        .fill(0)
        .map((_, i) => ({
            type: DataColumnChooserField.KEY,
            name: `${prefix}${i + start}`,
            dataType,
        }))
}

export function resolveColumns(
    data: object[],
    b: Block,
    count: number,
    options?: DataColumnChooseDeclareOptions
) {
    const { prefix = "column", start = 1, dataType } = options || {}
    const columns = unique(
        Array(count)
            .fill(0)
            .map((_, column) =>
                tidyResolveFieldColumn(data, b, `${prefix}${column + start}`, {
                    type: dataType,
                })
            )
            .filter(c => !!c)
    )
    return columns
}

export default class DataColumnChooserField extends FieldDropdown {
    static KEY = "ds_field_data_column_chooser"
    SERIALIZABLE = true
    dataType: string
    parentData: boolean | number

    static fromJson(options: ReactFieldJSON) {
        return new DataColumnChooserField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // the first argument is a dummy and never used
    constructor(options?: DataColumnChooseOptions) {
        super(() => [["", ""]], undefined, options)
        this.dataType = options?.dataType
        this.parentData = options?.parentData
    }

    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        const sourceBlock = this.getSourceBlock()
        const services = resolveBlockServices(
            this.parentData == 2
                ? sourceBlock?.getSurroundParent()?.getSurroundParent()
                : this.parentData
                ? sourceBlock?.getSurroundParent()
                : sourceBlock
        )
        const data = services?.data
        const { headers, types } = tidyHeaders(data)
        const options =
            headers
                .filter((h, i) => !this.dataType || types[i] === this.dataType)
                .map(h => [humanify(h), h]) || []
        const value = this.getValue()
        const r =
            options.length < 1
                ? [[humanify(value || ""), value || ""]]
                : [...options, ["", ""]]
        return r
    }

    doClassValidation_(newValue?: string) {
        // skip super class validationervices chan
        return newValue
    }
}
