import { resolveBlockServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import { tidyHeaders } from "./tidy"
import { FieldDropdown } from "blockly"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export interface DataColumnChooseOptions extends ReactFieldJSON {
    dataType?: "number" | "string"
    parentData?: boolean
}

export default class DataColumnChooserField extends FieldDropdown {
    static KEY = "jacdac_field_data_column_chooser"
    SERIALIZABLE = true
    dataType: string
    parentData: boolean

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
            this.parentData ? sourceBlock?.getSurroundParent() : sourceBlock
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
