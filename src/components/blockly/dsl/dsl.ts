import { Theme } from "@mui/material"
import Blockly, { Block, Workspace, WorkspaceSvg } from "blockly"
import {
    BlockDefinition,
    ContentDefinition,
    resolveBlockDefinition,
} from "../toolbox"
import { WorkspaceFile, WorkspaceJSON } from "./workspacejson"

export interface CreateBlocksOptions {
    theme: Theme
}

export interface CreateCategoryOptions {
    theme: Theme
    source: WorkspaceJSON
    directory?: boolean
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
    mount?: (workspace: Workspace) => () => void

    /**
     * Creates blocks for the DSL
     */
    createBlocks?: (
        options: CreateBlocksOptions
    ) => BlockDefinition[] | Promise<BlockDefinition[]>

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

    onWorkspaceJSONChange?: (workspaceJSON: WorkspaceJSON) => void

    onSave?: (file: WorkspaceFile) => void

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
