import DataTableField from "../fields/DataTableField"
import {
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    DummyInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const SHOW_TABLE_BLOCK = "chart_show_table"

const colour = "#999"
const chartDSL: BlockDomainSpecificLanguage = {
    id: "chart",
    createBlocks: () => [
        {
            kind: "block",
            type: SHOW_TABLE_BLOCK,
            message0: "show table %1 %2",
            args0: [
                <DummyInputDefinition>{
                    type: "input_dummy",
                },
                {
                    type: DataTableField.KEY,
                    name: "table",
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            colour,
            template: "meta",
            inputsInline: false,
            transformData: async (b, data) => data,
        },
    ],

    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Charts",
            contents: [
                <BlockReference>{ kind: "block", type: SHOW_TABLE_BLOCK },
            ],
            colour,
        },
    ],
}

export default chartDSL
