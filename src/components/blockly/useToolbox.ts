import Blockly from "blockly"
import { useEffect, useMemo } from "react"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { Theme, useTheme } from "@material-ui/core"
import { registerFields } from "./fields/fields"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    ServiceBlockDefinitionFactory,
    ToolboxConfiguration,
} from "./toolbox"
import { WorkspaceJSON } from "./jsongenerator"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import BlockDomainSpecificLanguage from "./dsl/dsl"

// overrides blockly emboss filter for svg elements
Blockly.BlockSvg.prototype.setHighlighted = function (highlighted) {
    if (!this.rendered) {
        return
    }
    if (highlighted) {
        this.addSelect()
    } else {
        this.removeSelect()
    }
}

type CachedBlockDefinitions = {
    blocks: BlockDefinition[]
}

function loadBlocks(
    dsls: BlockDomainSpecificLanguage[],
    theme: Theme
): CachedBlockDefinitions {
    const blocks = arrayConcatMany(
        dsls.map(dsl =>
            dsl?.createBlocks?.({ theme }).map(b => {
                b.dsl = dsl.id // ensure DSL is set
                return b
            })
        )
    )
    console.log(`blocks`, { blocks })

    // register field editors
    registerFields()
    // re-register blocks with blocklys
    blocks.forEach(
        block =>
            (Blockly.Blocks[block.type] = <ServiceBlockDefinitionFactory>{
                jacdacDefinition: block,
                init: function () {
                    this.jsonInit(block)
                },
            })
    )

    return {
        blocks,
    }
}

function patchCategoryJSONtoXML(cat: CategoryDefinition): CategoryDefinition {
    if (cat.button) {
        if (!cat.contents) cat.contents = []
        cat.contents.unshift(cat.button)
    }
    cat.contents
        ?.filter(node => node.kind === "block")
        .map(node => <BlockReference>node)
        .filter(block => {
            const exists = Blockly.Blocks[block.type]
            if (!exists && Flags.diagnostics)
                console.warn(
                    `block type '${block.type}' not found, consider refreshing page...`
                )
            return !!block.values && exists
        }) // avoid broken blocks
        .forEach(block => {
            // yup, this suck but we have to go through it
            block.blockxml = `<block type="${block.type}">${Object.keys(
                block.values
            )
                .map(name => {
                    const { type } = block.values[name]
                    return `<value name="${name}"><shadow type="${type}" /></value>`
                })
                .join("\n")}</block>`
            delete block.type
        })
    return cat
}

export default function useToolbox(
    dsls: BlockDomainSpecificLanguage[],
    source: WorkspaceJSON
): ToolboxConfiguration {
    const liveServices = useServices({ specification: true })
    const theme = useTheme()

    useMemo(() => loadBlocks(dsls, theme), [theme, dsls])

    const dslsCategories = arrayConcatMany(
        dsls.map(dsl => dsl?.createCategory?.({ theme, source, liveServices }))
    )
        .filter(cat => !!cat)
        .sort((l, r) => -(l.order - r.order))

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: dslsCategories
            .filter(cat => !!cat)
            .map(node =>
                node.kind === "category"
                    ? patchCategoryJSONtoXML(node as CategoryDefinition)
                    : node
            ),
    }

    return toolboxConfiguration
}

// do not use block context

export function useToolboxButtons(
    workspace: Blockly.WorkspaceSvg,
    toolboxConfiguration: ToolboxConfiguration
) {
    // track workspace changes and update callbacks
    useEffect(() => {
        if (!workspace) return

        // collect buttons
        const buttons: ButtonDefinition[] = toolboxConfiguration?.contents
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map(cat => (cat as CategoryDefinition).button)
            .filter(btn => !!btn)
        buttons?.forEach(button =>
            workspace.registerButtonCallback(button.callbackKey, () =>
                Blockly.Variables.createVariableButtonHandler(
                    workspace,
                    null,
                    button.service.shortId
                )
            )
        )
    }, [workspace, JSON.stringify(toolboxConfiguration)])
}
