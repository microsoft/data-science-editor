import {
    BlockWithServices,
    FieldWithServices,
    setBlockDataWarning,
} from "../WorkspaceContext"
import { Block, FieldDropdown } from "blockly"
import { withPrefix } from "gatsby"
import { downloadCSV } from "../dsl/workers/csv.proxy"

export const builtinDatasets = {
    Cereals: withPrefix("/datasets/cereal.csv"),
    Penguins: withPrefix("/datasets/penguins.csv"),
    /*
    "Gerrymangering (Bootstrap)": googleSheetUrl(
        "1L7hf0llI8dl8okVuat2fa1K4lqD5O301IFPi81vG7fc"
    ),
    "World Cities' Proximity to the Ocean (Bootstrap)": googleSheetUrl(
        "166F2V0uPtAIiU4BkITu8pDmU2hnPIWJaM3yDoOHyon0",
        "Data"
    ),*/
}

export default class BuiltinDataSetField
    extends FieldDropdown
    implements FieldWithServices
{
    static KEY = "ds_field_data_builtin_dataset"
    private initialized = false

    // eslint-disable-next-line @typescript-eslint/ban-types
    static fromJson(options: object) {
        return new BuiltinDataSetField(options)
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    constructor(options: object) {
        super(
            () => Object.keys(builtinDatasets).map(k => [k, k]),
            undefined,
            options
        )
    }

    init() {
        super.init()
        this.initialized = true
        this.updateData()
    }

    private async updateData() {
        if (!this.initialized) return

        const url = builtinDatasets[this.getValue()]
        if (!url) return

        this.updateDataFromUrl(url)
    }

    private async updateDataFromUrl(url: string) {
        // load dataset as needed
        const sourceBlock = this.getSourceBlock() as BlockWithServices
        const marker = !!sourceBlock?.isInsertionMarker()
        if (!sourceBlock || marker) return

        const services = sourceBlock.blockServices
        if (!services || services.cache[BuiltinDataSetField.KEY] === url) return // already downloaded
        // avoid races
        services.cache[BuiltinDataSetField.KEY] = url

        const { data, errors } = await downloadCSV(url)
        if (errors?.length) {
            setBlockDataWarning(sourceBlock, errors[0].message)
            console.debug(`csv parse errors`, {
                id: sourceBlock.id,
                marker,
                data,
                errors,
                services,
                url,
            })
        }
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
