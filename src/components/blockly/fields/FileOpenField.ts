/* eslint-disable @typescript-eslint/no-explicit-any */
import { Block, FieldDropdown } from "blockly"
import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import { parseCSV } from "../dsl/workers/csv.proxy"
import {
    resolveBlockServices,
    resolveWorkspaceServices,
} from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"

export default class FileOpenField extends FieldDropdown {
    static KEY = "jacdac_field_file_open"
    SERIALIZABLE = true
    // eslint-disable-next-line @typescript-eslint/ban-types
    private _data: object[]
    private _unmount: () => void

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

    dispose() {
        super.dispose()
        this.unmount()
    }

    private resolveFiles() {
        const sourceBlock = this.getSourceBlock()
        const services = resolveWorkspaceServices(sourceBlock?.workspace)
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
        const sourceBlock = this.getSourceBlock()
        // update current data
        const blockServices = resolveBlockServices(sourceBlock)
        if (!blockServices) blockServices.data = this._data

        // register file system changes
        this.unmount()
        const wsServices = resolveWorkspaceServices(sourceBlock?.workspace)
        if (wsServices) {
            const { workingDirectory } = wsServices
            this._unmount = workingDirectory.subscribe(CHANGE, () =>
                this.updateData()
            )
        }
    }

    private unmount() {
        if (this._unmount) {
            this._unmount()
            this._unmount = undefined
        }
    }
}
