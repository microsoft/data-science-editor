import { BlockWithServices, FieldWithServices } from "../WorkspaceContext"
import { Block, FieldDropdown } from "blockly"
import { withPrefix } from "gatsby"
import { downloadCSV } from "../dsl/workers/csv.proxy"

const builtins = {
    cereal: withPrefix("/datasets/cereal.csv"),
    penguins: withPrefix("/datasets/penguins.csv"),
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

    private async updateData() {
        const url = builtins[this.getValue()]
        if (!url) return

        // load dataset as needed
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const services = sourceBlock?.jacdacServices
        if (!services || services.cache[BuiltinDataSetField.KEY] === url) return // already downloaded

        const { data, errors } = await downloadCSV(url)
        console.debug(`csv parse`, { data, errors })
        services.cache[BuiltinDataSetField.KEY] = url
        services.data = data
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
        this.updateData()
    }
}
