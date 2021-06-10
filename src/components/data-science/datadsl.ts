import { BlockDefinition, CategoryDefinition } from "../blockly/toolbox"
import BlockDomainSpecificLanguage from "../blockly/dsl/dsl"

const colour = "#123456"
export class DataScienceBlockDomainSpecificLanguage
    implements BlockDomainSpecificLanguage
{
    id = "dataScience"
    createBlocks() {
        const blocks: BlockDefinition[] = [
            {
                kind: "block",
                type: "ds_some_block",
                message0: "some block data",
                args0: [],
                inputsInline: true,
                output: "Number",
                colour,
            } as BlockDefinition,
        ]
        return blocks
    }

    createCategory() {
        return [
            <CategoryDefinition>{
                kind: "category",
                name: "Data Science",
                colour,
                contents: [
                    {
                        kind: "block",
                        type: "ds_some_block",
                    },
                ],
            },
        ]
    }
}

const dataDsl = new DataScienceBlockDomainSpecificLanguage()
export default dataDsl
