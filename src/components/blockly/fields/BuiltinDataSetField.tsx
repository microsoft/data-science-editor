import { BlockWithServices, FieldWithServices } from "../WorkspaceContext"
import { Block, FieldDropdown } from "blockly"
import { withPrefix } from "gatsby"
import { postLoadCSV } from "../dsl/workers/data.worker"

const builtins = {
    dummy: withPrefix("/datasets/dummy.csv"),
}

export default class BuiltinDataSetField
    extends FieldDropdown
    implements FieldWithServices
{
    static KEY = "jacdac_field_data_builtin_dataset"

    // eslint-disable-next-line @typescript-eslint/ban-types
    static fromJson(options: object) {
        return new BuiltinDataSetField(options)
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(options: object) {
        super(() => Object.keys(builtins).map(k => [k, k]), undefined, options)
    }

    private updateData() {
        const url = builtins[this.getValue()]
        if (!url) return

        // load dataset as needed
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const services = sourceBlock?.jacdacServices
        console.log("update data", { sourceBlock, services })
        if (!services) return

        if (services.cache[BuiltinDataSetField.KEY] === url) return // already downloaded

        console.log(`downloading ${url}`)
        postLoadCSV(url).then(({ data, errors }) => {
            console.debug(`csv parse`, { data, errors })
            services.data = data
            services.cache[BuiltinDataSetField.KEY] = url
        })
    }

    setSourceBlock(block: Block) {
        super.setSourceBlock(block)
        this.updateData()
    }

    doValueUpdate_(newValue) {
        super.doValueUpdate_(newValue)
        this.updateData()
    }

    notifyServicesChanged() {
        console.log(`services changed`)
        this.updateData()
    }
}
