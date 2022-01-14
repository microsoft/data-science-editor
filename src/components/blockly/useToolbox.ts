import Blockly from "blockly"
import { useEffect, useMemo } from "react"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import { Theme, useTheme } from "@mui/material"
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
import BlockDomainSpecificLanguage from "./dsl/dsl"
import { addDataPreviewField } from "./fields/DataPreviewField"
import { WorkspaceJSON } from "./dsl/workspacejson"
import useAsyncMemo from "../hooks/useAsyncMemo"

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

async function loadBlocks(
    dsls: BlockDomainSpecificLanguage[],
    theme: Theme
): Promise<CachedBlockDefinitions> {
    const blocks: BlockDefinition[] = []
    for (const dsl of dsls) {
        const dslBlocks = await dsl?.createBlocks?.({ theme })
        if (dslBlocks)
            for (const b of dslBlocks) {
                addDataPreviewField(b)
                b.dsl = dsl.id // ensure DSL is set
                blocks.push(b)
            }
    }
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

    const blocks = useAsyncMemo(async () => {
        const r = await loadBlocks(dsls, theme)
        if (Flags.diagnostics) console.debug(`blocks`, r)
        return r
    }, [theme, dsls])
    const toolboxConfiguration = useMemo(() => {
        if (!blocks) return undefined

        const dslsCategories = arrayConcatMany(
            dsls.map(dsl =>
                dsl?.createCategory?.({ theme, source, liveServices })
            )
        )
            .filter(cat => !!cat)
            .sort((l, r) => -((l.order || 0) - (r.order || 0)))
        const contents = dslsCategories.map(node =>
            node.kind === "category"
                ? patchCategoryJSONtoXML(node as CategoryDefinition)
                : node
        )
        // remove trailing separators
        while (contents[0]?.kind === "sep") contents.shift()
        while (contents[contents.length - 1]?.kind === "sep") contents.pop()
        //
        return <ToolboxConfiguration>{
            kind: "categoryToolbox",
            contents,
        }
    }, [
        blocks,
        theme,
        dsls,
        source,
        (liveServices || []).map(srv => srv.id).join(","),
    ])

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
