import { Theme } from "@material-ui/core"
import { Block, Workspace } from "blockly"
import { RoleEvent } from "../../../../jacdac-ts/src/vm/compile"
import { VMError } from "../../../../jacdac-ts/src/vm/ir"
import { BlockJSON, WorkspaceJSON } from "../jsongenerator"
import {
    BlockDefinition,
    CategoryDefinition,
    ServiceBlockDefinition,
} from "../toolbox"
import { ExpressionWithErrors } from "../VMgenerator"

export default interface BlockDomainSpecificLanguage {
    id: string
    createBlocks?: (options: {
        theme: Theme
        supportedServices: jdspec.ServiceSpec[]
    }) => BlockDefinition[]

    createCategory?: (options: {
        theme: Theme
        source: WorkspaceJSON
    }) => CategoryDefinition[]

    convertToJSON?: (options: {
        workspace: Workspace
        block: Block
        definition: BlockDefinition
    }) => BlockJSON

    compileToVM?: (options: {
        block: BlockJSON
        definition: ServiceBlockDefinition
        blockToExpression: (
            ev: RoleEvent,
            block: BlockJSON
        ) => ExpressionWithErrors
    }) => {
        event?: RoleEvent
        expression?: jsep.Expression
        errors?: VMError[]
    }
}
