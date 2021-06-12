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
    constructor(options?: any) {
        super([["", ""]], undefined, options)
    }

    getOptions(): string[][] {
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const services = sourceBlock?.jacdacServices
        const data = services?.data
        const headers = tidyHeaders(data)
        const options = headers?.map(h => [h, h]) || []
        console.log({ options })
        return options.length < 1 ? [["", ""]] : options
    }
}
