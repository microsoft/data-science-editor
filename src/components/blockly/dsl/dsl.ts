import { Theme } from "@material-ui/core"
import { Block } from "blockly"
import { JDService } from "../../../../jacdac-ts/src/jdom/service"
import { RoleEvent } from "../../../../jacdac-ts/src/vm/compile"
import { VMError } from "../../../../jacdac-ts/src/vm/ir"
import { BlockJSON, WorkspaceJSON } from "../jsongenerator"
import {
    BlockDefinition,
    ContentDefinition,
    ServiceBlockDefinition,
} from "../toolbox"
import { CmdWithErrors, ExpressionWithErrors } from "../../vm/VMgenerator"

export interface CreateBlocksOptions {
    theme: Theme
}

export interface CreateCategoryOptions {
    theme: Theme
    source: WorkspaceJSON
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
    /**
     * A unique identifier used to route blocks back to the DSL
     */
    id: string

    /**
     * A list of builtin block types, typically provided by Blockly
     */
    types?: string[]

    /**
     * Creates blocks for the DSL
     */
    createBlocks?: (options: CreateBlocksOptions) => BlockDefinition[]

    /***
     * Creates a JSON category to populate the toolbox
     */
    createCategory?: (options: CreateCategoryOptions) => ContentDefinition[]

    /**
     * Shorthand to convert block JSON into a primitive value
     */
    blockToValue?: (block: Block) => string | number | boolean

    // VM support
    compileEventToVM?: (
        options: CompileEventToVMOptions
    ) => CompileEventToVMResult

    compileCommandToVM?: (options: CompileCommandToVMOptions) => CmdWithErrors

    compileExpressionToVM?: (
        options: CompileExpressionToVMOptions
    ) => ExpressionWithErrors
}
