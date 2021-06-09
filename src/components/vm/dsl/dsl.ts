import { Theme } from "@material-ui/core"
import { Block } from "blockly"
import { JDService } from "../../../../jacdac-ts/src/jdom/service"
import { RoleEvent } from "../../../../jacdac-ts/src/vm/compile"
import { VMError, VMProgram } from "../../../../jacdac-ts/src/vm/ir"
import { BlockJSON, WorkspaceJSON } from "../jsongenerator"
import {
    BlockDefinition,
    ContentDefinition,
    ServiceBlockDefinition,
} from "../toolbox"
import { CmdWithErrors, ExpressionWithErrors } from "../VMgenerator"

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
    meta?: boolean
}

export interface CompileExpressionToVMOptions {
    event: RoleEvent
    block: BlockJSON
    definition: ServiceBlockDefinition
    blockToExpressionInner: (ev: RoleEvent, block: BlockJSON) => jsep.Expression
}

export interface CompileCommandToVMOptions {
    event: RoleEvent
    block: BlockJSON
    definition: ServiceBlockDefinition
    blockToExpression: (ev: RoleEvent, block: BlockJSON) => ExpressionWithErrors
}

export default interface BlockDomainSpecificLanguage {
    id: string
    createBlocks?: (options: CreateBlocksOptions) => BlockDefinition[]

    createCategory?: (options: CreateCategoryOptions) => ContentDefinition[]

    blockToValue?: (block: Block) => string | number | boolean

    compileEventToVM?: (
        options: CompileEventToVMOptions
    ) => CompileEventToVMResult

    compileCommandToVM?: (
        options: CompileCommandToVMOptions
    ) => CmdWithErrors

    compileExpressionToVM?: (
        options: CompileExpressionToVMOptions
    ) => ExpressionWithErrors
}
