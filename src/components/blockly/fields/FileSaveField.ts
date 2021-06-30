/* eslint-disable @typescript-eslint/no-explicit-any */
import { Field } from "blockly"

export default class FileSaveField extends Field {
    static KEY = "jacdac_field_file_save"
    SERIALIZABLE = true
    private fileType: string

    constructor(options?: any) {
        super("...", null, options)
        this.fileType = options?.fileType || "csv"
    }
    fileHandle: FileSystemFileHandle

    static fromJson(options: any) {
        return new FileSaveField(options)
    }

    showEditor_() {
        this.openFileHandle()
    }

    private async openFileHandle() {
        const options: SaveFilePickerOptions = {
            types: [
                {
                    id: "text",
                    description: "Text Files",
                    accept: {
                        "text/plain": [".txt"],
                    },
                },
                {
                    id: "csv",
                    description: "CSV Files",
                    accept: {
                        "text/csv": [".csv"],
                    },
                },
                {
                    id: "json",
                    description: "JSON Files",
                    accept: {
                        "application/json": [".json"],
                    },
                },
            ].filter(({ id }) => this.fileType === id),
            excludeAcceptAllOption: true,
        }
        this.fileHandle = await window.showSaveFilePicker?.(options)
        this.setValue(this.fileHandle?.name || "")
    }
}
