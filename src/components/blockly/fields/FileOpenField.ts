/* eslint-disable @typescript-eslint/no-explicit-any */
import { Block, Field } from "blockly"
import { parseCSV } from "../dsl/workers/csv.proxy"
import { BlockWithServices, FieldWithServices } from "../WorkspaceContext"

// inline browser-fs-access until issue of ssr is fixed
const getFileWithHandle = async handle => {
    const file = await handle.getFile()
    file.handle = handle
    return file
}
const fileOpen = async (options: any = {}) => {
    const accept = {}
    if (options.mimeTypes) {
        options.mimeTypes.map(mimeType => {
            accept[mimeType] = options.extensions || []
        })
    } else {
        accept["*/*"] = options.extensions || []
    }
    const handleOrHandles = await window.showOpenFilePicker({
        types: [
            {
                description: options.description || "",
                accept: accept,
            },
        ],
        multiple: options.multiple || false,
    })
    const files = await Promise.all(handleOrHandles.map(getFileWithHandle))
    if (options.multiple) {
        return files
    }
    return files[0]
}

interface FileOpenFieldValue {
    name: string
    source: string
}

const MAX_SIZE = 100_000 // 100kb
export default class FileOpenField extends Field implements FieldWithServices {
    static KEY = "jacdac_field_file_open"
    SERIALIZABLE = true
    // eslint-disable-next-line @typescript-eslint/ban-types
    private _data: object[]

    constructor(options?: any) {
        super("...", null, options)
    }

    static fromJson(options: any) {
        return new FileOpenField(options)
    }

    toXml(fieldElement: Element) {
        const text = JSON.stringify(this.value_)
        if (text.length < MAX_SIZE) fieldElement.textContent = text
        else fieldElement.textContent = ""
        return fieldElement
    }

    fromXml(fieldElement: Element) {
        try {
            const v = JSON.parse(fieldElement.textContent)
            this.value_ = v
            this.parseSource()
        } catch (e) {
            console.log(e, { text: fieldElement.textContent })
            this.value_ = undefined
        }
    }

    getText_() {
        return (this.value_ as FileOpenFieldValue)?.name || "..."
    }

    setSourceBlock(block: Block) {
        super.setSourceBlock(block)
        this.updateData()
    }

    doValueUpdate_(newValue) {
        super.doValueUpdate_(newValue)
        this.parseSource()
    }

    private async parseSource() {
        const source = (this.value_ as FileOpenFieldValue)?.source
        if (source) {
            const csv = await parseCSV(source)
            this._data = csv?.data
            this.updateData()
        }
    }

    notifyServicesChanged() {
        this.updateData()
    }

    private async updateData() {
        const block = this.getSourceBlock() as BlockWithServices
        const services = block?.jacdacServices
        if (!services) return
        services.data = this._data
    }

    showEditor_() {
        this.openFileHandle()
    }

    private async openFileHandle() {
        const file = await fileOpen({
            mimeTypes: ["text/csv"],
            extensions: [".csv"],
            description: "CSV data sets",
            multiple: false,
        })
        if (!file) return
        const source = await file.text()
        this.setValue(<FileOpenFieldValue>{
            name: file.name,
            source,
        })
    }
}
