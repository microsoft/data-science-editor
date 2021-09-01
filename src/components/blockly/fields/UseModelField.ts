/* eslint-disable @typescript-eslint/no-explicit-any */
import { Block, FieldDropdown } from "blockly"
import { CHANGE } from "../../../../jacdac-ts/src/jdom/constants"
import type { TFModelObj } from "../../../workers/tf/dist/node_modules/tf.worker"

import { resolveWorkspaceServices } from "../WorkspaceContext"
import { ReactFieldJSON } from "./ReactField"

export default class UseModelField extends FieldDropdown {
    static KEY = "jacdac_field_mlblocks_model_open"
    SERIALIZABLE = true
    // eslint-disable-next-line @typescript-eslint/ban-types
    private _models: Record<string, TFModelObj>
    private _unmount: () => void

    static fromJson(options: ReactFieldJSON) {
        return new UseModelField(options)
    }

    constructor(options?: ReactFieldJSON) {
        super(() => [["", ""]], undefined, options)
        this._models = {}
    }

    fromXml(fieldElement: Element) {
        this.setValue(fieldElement.textContent)
    }

    getOptions(): string[][] {
        let options = []
        if (this._models) options = Object.keys(this._models).map(m => [m, m])
        const value = this.getValue()

        return options.length < 1
            ? [[value || "", value || ""]]
            : [...options, ["", ""]]
    }

    doClassValidation_(newValue?: string) {
        // skip super class validation
        return newValue
    }

    init() {
        super.init()
        this.populateModels()
    }

    setSourceBlock(block: Block) {
        super.setSourceBlock(block)
        this.populateModels()
    }

    doValueUpdate_(newValue) {
        super.doValueUpdate_(newValue)
    }

    notifyServicesChanged() {
        this.populateModels()
    }

    dispose() {
        super.dispose()
        this.unmount()
    }

    private resolveFiles() {
        const sourceBlock = this.getSourceBlock()
        const services = resolveWorkspaceServices(sourceBlock?.workspace)
        const directory = services?.workingDirectory
        return directory?.files.filter(f => /\.json$/i.test(f.name))
    }

    private async populateModels() {
        const files = this.resolveFiles()
        if (!files) return

        files.forEach(async file => {
            if (file) {
                try {
                    // grab the content of the JSON file
                    const source = await file.textAsync()
                    const model = JSON.parse(source)

                    if (model && model.status == "trained")
                        this._models[file.name] = model
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }

    async getModel() {
        const filename = this.getValue()

        let selectedModel = this._models[filename]
        if (!selectedModel) {
            // if that did not work, refresh model list and try again
            this.populateModels()
            selectedModel = this._models[filename]
        }

        // if that did not work, this model cannot be loaded
        if (!selectedModel) this.value_ = undefined

        return selectedModel
    }

    private unmount() {
        if (this._unmount) {
            this._unmount()
            this._unmount = undefined
        }
    }
}
