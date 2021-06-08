import { Theme } from "@material-ui/core"
import { Block, Workspace } from "blockly"
import { BlockJSON, WorkspaceJSON } from "../jsongenerator"
import { BlockDefinition, CategoryDefinition } from "../toolbox"

export default interface BlockDomainSpecificLanguage {
    id: string
    createBlocks(options: {
        theme: Theme
        supportedServices: jdspec.ServiceSpec[]
    }): BlockDefinition[]

    createCategory(options: {
        theme: Theme
        source: WorkspaceJSON
    }): CategoryDefinition[]

    convertToJSON?: (options: {
        workspace: Workspace
        block: Block
        definition: BlockDefinition
    }) => BlockJSON
}
