import { BlockWithServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import { tidyHeaders } from "./tidy"
import { FieldDropdown } from "blockly"
import { humanify } from "../../../../jacdac-ts/jacdac-spec/spectool/jdspec"

export interface DataColumnChooseOptions extends ReactFieldJSON {
    dataType?: "number" | "string"
}

export default class DataColumnChooserField extends FieldDropdown {
    static KEY = "jacdac_field_data_column_chooser"

    static fromJson(options: ReactFieldJSON) {
        return new DataColumnChooserField(options)
    }
    dataType: string

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // the first argument is a dummy and never used
    constructor(options?: DataColumnChooseOptions) {
        super(() => [["", ""]], undefined, options)
        this.dataType = options?.dataType
    }

    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const services = sourceBlock?.jacdacServices
        const data = services?.data
        const { headers, types } = tidyHeaders(data)
        const options =
            headers
                .filter((h, i) => !this.dataType || types[i] === this.dataType)
                .map(h => [humanify(h), h]) || []
        const value = this.getValue()
        return options.length < 1
            ? [[humanify(value || ""), value || ""]]
            : [...options, ["", ""]]
    }

    doClassValidation_(newValue?: string) {
        // skip super class validationervices chan
        return newValue
    }
}
