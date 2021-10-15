import { ReactFieldJSON } from "./ReactField"
import { FieldDropdown } from "blockly"

export interface IFrameDataChooserOptions extends ReactFieldJSON {
    dataId: string
}

export const AllOptions: Record<string, [string, string][]> = {}

export default class IFrameDataChooserField extends FieldDropdown {
    static KEY = "jacdac_field_iframe_data_chooser"
    SERIALIZABLE = true
    dataId: string

    static fromJson(options: ReactFieldJSON) {
        return new IFrameDataChooserField(options)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // the first argument is a dummy and never used
    constructor(options?: IFrameDataChooserOptions) {
        super(() => [["", ""]], undefined, options)
        this.dataId = options.dataId || ""
    }

    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        const options = AllOptions[this.dataId]?.slice(0)
        return !options?.length ? [["", ""]] : options
    }

    doClassValidation_(newValue?: string) {
        // skip super class validationervices chan
        return newValue
    }
}
