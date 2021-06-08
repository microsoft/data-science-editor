import { Theme } from "@material-ui/core"
import { Block, Workspace } from "blockly"
import { JDService } from "../../../../jacdac-ts/src/jdom/service"
import { RoleEvent } from "../../../../jacdac-ts/src/vm/compile"
import { VMError, VMProgram } from "../../../../jacdac-ts/src/vm/ir"
import { BlockJSON, WorkspaceJSON } from "../jsongenerator"
import {
    BlockDefinition,
    ContentDefinition,
    ServiceBlockDefinition,
} from "../toolbox"
import { ExpressionWithErrors } from "../VMgenerator"

export interface CreateBlocksOptions {
    theme: Theme
}

export interface CreateCategoryOptions {
    theme: Theme
    source: WorkspaceJSON
    program: VMProgram
    liveServices: JDService[]
}

export interface CompileEventToVMOptions {
    block: BlockJSON
    definition: ServiceBlockDefinition
    blockToExpression: (ev: RoleEvent, block: BlockJSON) => ExpressionWithErrors
}

export interface CompileEventToVMResult {
    event?: RoleEvent
    expression?: jsep.Expression
    errors?: VMError[]
}

export default interface BlockDomainSpecificLanguage {
    id: string
    createBlocks?: (options: CreateBlocksOptions) => BlockDefinition[]

    createCategory?: (options: CreateCategoryOptions) => ContentDefinition[]

    blockToValue?: (block: Block) => string | number | boolean

    compileEventToVM?: (
        options: CompileEventToVMOptions
    ) => CompileEventToVMResult
}
