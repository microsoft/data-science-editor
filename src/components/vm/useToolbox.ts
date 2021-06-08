import Blockly from "blockly"
import { useContext, useEffect, useMemo } from "react"
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
    CODE_STATEMENT_TYPE,
    InputDefinition,
    NEW_PROJET_XML,
    REPEAT_EVERY_BLOCK,
    ServiceBlockDefinitionFactory,
    ToolboxConfiguration,
    ValueInputDefinition,
    WAIT_BLOCK,
} from "./toolbox"
import { WorkspaceJSON } from "./jsongenerator"
import { VMProgram } from "../../../jacdac-ts/src/vm/ir"
import DslContext from "./dsl/DslContext"
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

function createBlockTheme(theme: Theme) {
    const otherColor = theme.palette.info.main
    const commandColor = theme.palette.warning.main
    return {
        commandColor,
        otherColor,
    }
}

function loadBlocks(
    dsls: BlockDomainSpecificLanguage[],
    theme: Theme,
    commandColor: string
): CachedBlockDefinitions {
    const runtimeBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: WAIT_BLOCK,
            message0: "wait %1 s",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "time",
                    check: "Number",
                },
            ],
            inputsInline: true,
            previousStatement: CODE_STATEMENT_TYPE,
            nextStatement: CODE_STATEMENT_TYPE,
            colour: commandColor,
            tooltip: "Wait the desired time",
            helpUrl: "",
        },
        {
            kind: "block",
            type: REPEAT_EVERY_BLOCK,
            message0: `repeat every %1s`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "interval",
                    check: "Number",
                },
            ],
            colour: commandColor,
            inputsInline: true,
            tooltip: `Repeats code at a given interval in seconds`,
            helpUrl: "",
            template: "every",
            nextStatement: CODE_STATEMENT_TYPE,
        },
    ]

    const dslsBlocks = arrayConcatMany(
        dsls.map(dsl =>
            dsl?.createBlocks?.({ theme }).map(b => {
                b.dsl = dsl.id // ensure DSL is set
                return b
            })
        )
    )

    const blocks: BlockDefinition[] = [...runtimeBlocks, ...dslsBlocks]

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

export default function useToolbox(props: {
    blockServices?: string[]
    source?: WorkspaceJSON
    program?: VMProgram
}): {
    toolboxConfiguration: ToolboxConfiguration
    newProjectXml: string
} {
    const { source, program } = props
    const liveServices = useServices({ specification: true })

    const { dsls } = useContext(DslContext)
    const theme = useTheme()
    const { commandColor } = createBlockTheme(theme)
    useMemo(() => loadBlocks(dsls, theme, commandColor), [theme, dsls])

    const commandsCategory: CategoryDefinition = {
        kind: "category",
        name: "Commands",
        order: 4,
        colour: commandColor,
        contents: [
            <BlockDefinition>{
                kind: "block",
                type: REPEAT_EVERY_BLOCK,
                values: {
                    interval: { kind: "block", type: "jacdac_time_picker" },
                },
            },
            <BlockDefinition>{
                kind: "block",
                type: WAIT_BLOCK,
                values: {
                    time: { kind: "block", type: "jacdac_time_picker" },
                },
            },
        ].filter(b => !!b),
    }

    const dslsCategories = arrayConcatMany(
        dsls.map(dsl =>
            dsl?.createCategory?.({ theme, source, program, liveServices })
        )
    )
        .filter(cat => !!cat)
        .sort((l, r) => -(l.order - r.order))

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: [commandsCategory, ...dslsCategories]
            .filter(cat => !!cat)
            .map(node =>
                node.kind === "category"
                    ? patchCategoryJSONtoXML(node as CategoryDefinition)
                    : node
            ),
    }

    return {
        toolboxConfiguration,
        newProjectXml: NEW_PROJET_XML,
    }
}

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
