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
    visitToolbox,
} from "./toolbox"
import { WorkspaceJSON } from "./jsongenerator"
import BlockDomainSpecificLanguage from "./dsl/dsl"
import { addDataPreviewField } from "./fields/DataPreviewField"

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
                addDataPreviewField(b)
                b.dsl = dsl.id // ensure DSL is set
                return b
            })
        )
    )

    // register field editors
    registerFields()
    // re-register blocks with blocklys
    blocks.forEach(
        block =>
            (Blockly.Blocks[block.type] = <
                ServiceBlockDefinitionFactory<BlockDefinition>
            >{
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
                    const shadow = type !== "variables_get"
                    return `<value name="${name}"><${
                        shadow ? "shadow" : "field"
                    } type="${type}" /></value>`
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
    const toolboxConfiguration = useMemo(() => {
        const dslsCategories = arrayConcatMany(
            dsls.map(dsl =>
                dsl?.createCategory?.({ theme, source, liveServices })
            )
        )
            .filter(cat => !!cat)
            .sort((l, r) => -(l.order - r.order))

        return <ToolboxConfiguration>{
            kind: "categoryToolbox",
            contents: dslsCategories
                .filter(cat => !!cat)
                .map(node =>
                    node.kind === "category"
                        ? patchCategoryJSONtoXML(node as CategoryDefinition)
                        : node
                ),
        }
    }, [theme, dsls, source, (liveServices || []).map(srv => srv.id).join(",")])
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
        const buttons: ButtonDefinition[] = []
        visitToolbox(toolboxConfiguration, {
            visitButton: btn => buttons.push(btn),
        })
        // register buttons
        buttons.forEach(button =>
            workspace.registerButtonCallback(button.callbackKey, () =>
                button.callback(workspace)
            )
        )
        // cleanup
        return () =>
            buttons.forEach(button =>
                workspace.removeButtonCallback(button.callbackKey)
            )
    }, [workspace, toolboxConfiguration])
}
