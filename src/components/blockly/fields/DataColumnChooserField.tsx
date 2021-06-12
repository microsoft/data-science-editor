import { BlockWithServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"
import { tidyHeaders } from "./nivo"
import { FieldDropdown } from "blockly"

export default class DataColumnChooserField extends FieldDropdown {
    static KEY = "jacdac_field_data_column_chooser"

    static fromJson(options: ReactFieldJSON) {
        return new DataColumnChooserField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // the first argument is a dummy and never used
    constructor(options?: unknown) {
        super(() => [["", ""]], undefined, options)
    }

    fromXml(fieldElement: Element) {
        console.log("fromXml", fieldElement)
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const services = sourceBlock?.jacdacServices
        const data = services?.data
        const headers = tidyHeaders(data)
        const options = headers?.map(h => [h, h]) || []
        const value = this.getValue()
        return options.length < 1 ? [[value || "", value || ""]] : options
    }

    doClassValidation_(newValue?: string) {
        console.log(`validate`, { newValue })
        return newValue
    }
}
