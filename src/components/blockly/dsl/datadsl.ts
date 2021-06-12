import { BlockSvg } from "blockly"
import {
    BlockReference,
    CategoryDefinition,
    DATA_SCIENCE_STATEMENT_TYPE,
    OptionsInputDefinition,
    TextInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import { ArrangeMessage, transformData } from "./workers/data.worker"

const DATA_SCIENCE_ARRANGE_BLOCK = "data_science_arrange"

const colour = "#777"
const dataDsl: BlockDomainSpecificLanguage = {
    id: "dataScience",
    createBlocks: () => [
        {
            kind: "block",
            type: "data_science_arrange",
            message0: "arrange %1 %2",
            colour,
            args0: [
                <TextInputDefinition>{
                    type: "field_input",
                    name: "column",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "order",
                    options: [
                        ["ascending", "ascending"],
                        ["descending", "descending"],
                    ],
                },
            ],
            previousStatement: DATA_SCIENCE_STATEMENT_TYPE,
            nextStatement: DATA_SCIENCE_STATEMENT_TYPE,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            transformData: (b: BlockSvg, data: any[]) => {
                const column = b.getFieldValue("column")
                const order = b.getFieldValue("order")
                const descending = order === "descending"
                return transformData(<ArrangeMessage>{
                    type: "arrange",
                    column,
                    descending,
                    data,
                })
            },
            template: "meta",
        },
    ],
    createCategory: () => [
        <CategoryDefinition>{
            kind: "category",
            name: "Data Science",
            colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: DATA_SCIENCE_ARRANGE_BLOCK,
                },
            ],
        },
    ],
}
export default dataDsl
