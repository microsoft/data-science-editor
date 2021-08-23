import { Theme } from "@material-ui/core"
import Blockly, { Block, Workspace, WorkspaceSvg } from "blockly"
import JDService from "../../../../jacdac-ts/src/jdom/service"
import { RoleEvent } from "../../../../jacdac-ts/src/vm/compile"
import { VMError } from "../../../../jacdac-ts/src/vm/ir"
import {
    BlockDefinition,
    ContentDefinition,
    resolveBlockDefinition,
    ServiceBlockDefinition,
} from "../toolbox"
import { CmdWithErrors, ExpressionWithErrors } from "../../vm/VMgenerator"
import {
    BlockJSON,
    WorkspaceFile,
    WorkspaceJSON,
} from "../../../../jacdac-ts/src/dsl/workspacejson"

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
     * Optional API to be called when mounted in the React context, returns unmounted
     */
    mount?: () => () => void

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

    /**
     * Returns a change listener if needed
     */
    createWorkspaceChangeListener?: (
        workspace: WorkspaceSvg
    ) => (event: Blockly.Events.Abstract) => void

    /**
     * After a successfull parse and save, opportunity to walk the JSON tree
     * and attach warnings
     */
    visitWorkspaceJSON?: (
        workspace: Workspace,
        workspaceJSON: WorkspaceJSON
    ) => void

    // VM support
    compileEventToVM?: (
        options: CompileEventToVMOptions
    ) => CompileEventToVMResult

    compileCommandToVM?: (options: CompileCommandToVMOptions) => CmdWithErrors

    compileExpressionToVM?: (
        options: CompileExpressionToVMOptions
    ) => ExpressionWithErrors

    onBeforeSaveWorkspaceFile?: (file: WorkspaceFile) => void
}

export function resolveDsl(dsls: BlockDomainSpecificLanguage[], type: string) {
    const dsl = dsls?.find(dsl => dsl.types?.indexOf(type) > -1)
    if (dsl) return dsl

    const { dsl: dslName } = resolveBlockDefinition(type) || {}
    if (!dslName) {
        console.warn(`unknown dsl for ${type}`)
        return undefined
    }
    return dsls?.find(dsl => dsl.id === dslName)
}
