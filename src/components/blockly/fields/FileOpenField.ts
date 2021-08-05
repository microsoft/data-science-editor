/* eslint-disable @typescript-eslint/no-explicit-any */
import { Block, FieldDropdown } from "blockly"
import { parseCSV } from "../dsl/workers/csv.proxy"
import { BlockWithServices, WorkspaceWithServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"

export default class FileOpenField extends FieldDropdown {
    static KEY = "jacdac_field_file_open"
    SERIALIZABLE = true
    // eslint-disable-next-line @typescript-eslint/ban-types
    private _data: object[]

    static fromJson(options: ReactFieldJSON) {
        return new FileOpenField(options)
    }

    constructor(options?: ReactFieldJSON) {
        super(() => [["", ""]], undefined, options)
    }
    
    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        const options = this.resolveFiles()?.map(f => [f.name, f.name]) || []
        const value = this.getValue()

        return options.length < 1
            ? [[value || "", value || ""]]
            : [...options, ["", ""]]
    }

    doClassValidation_(newValue?: string) {
        // skip super class validationervices chan
        return newValue
    }

    init() {
        super.init()
        this.updateData()
    }

    setSourceBlock(block: Block) {
        super.setSourceBlock(block)
        this.updateData()
    }

    doValueUpdate_(newValue) {
        super.doValueUpdate_(newValue)
        this.parseSource()
    }

    notifyServicesChanged() {
        this.updateData()
    }

    private resolveFiles() {
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const workspace = sourceBlock?.workspace as WorkspaceWithServices
        const services = workspace?.jacdacServices
        const directory = services?.workingDirectory
        return directory?.files.filter(f => /\.csv$/i.test(f.name))
    }

    private async parseSource() {
        const filename = this.getValue()
        const file = this.resolveFiles()?.find(f => f.name === filename)
        if (file) {
            try {
                console.debug(`file: loading ${file.name}`)
                const source = await file.textAsync()
                console.debug(`file: loaded ${(source?.length || 0) / 1024}kb`)
                if (source) {
                    const csv = await parseCSV(source)
                    this._data = csv?.data
                    this.updateData()
                }
            } catch (e) {
                console.log(e)
                this.value_ = undefined
            }
        }
    }

    private async updateData() {
        const block = this.getSourceBlock() as BlockWithServices
        const services = block?.jacdacServices
        if (!services) return
        services.data = this._data
    }
}
