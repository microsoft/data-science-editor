import Blockly from "blockly"
import { useContext, useEffect, useMemo } from "react"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "../hooks/useServices"
import Flags from "../../../jacdac-ts/src/jdom/flags"
import { Theme, useTheme } from "@material-ui/core"
import { fieldShadows, registerFields } from "./fields/fields"
import {
    BlockDefinition,
    BlockReference,
    ButtonDefinition,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    ColorInputDefnition,
    InputDefinition,
    NEW_PROJET_XML,
    NumberInputDefinition,
    OptionsInputDefinition,
    REPEAT_EVERY_BLOCK,
    SeparatorDefinition,
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
    const shadowBlocks: BlockDefinition[] = [
        ...fieldShadows(),
        {
            kind: "block",
            type: `jacdac_on_off`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["enabled", "on"],
                        ["disabled", "off"],
                    ],
                },
            ],
            style: "logic_blocks",
            output: "Boolean",
        },
        {
            kind: "block",
            type: `jacdac_yes_no`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["yes", "on"],
                        ["no", "off"],
                    ],
                },
            ],
            style: "logic_blocks",
            output: "Boolean",
        },
        {
            kind: "block",
            type: `jacdac_time_picker`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["0.1", "0.1"],
                        ["1", "1"],
                        ["5", "5"],
                        ["30", "30"],
                        ["60", "60"],
                    ],
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_angle`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_angle",
                    name: "value",
                    min: 0,
                    max: 360,
                    precision: 10,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_percent`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 100,
                    precision: 1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_byte`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 255,
                    precision: 1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_ratio`,
            message0: `%1`,
            args0: [
                <NumberInputDefinition>{
                    type: "field_slider",
                    name: "value",
                    min: 0,
                    max: 1,
                    precision: 0.1,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_color`,
            message0: `%1`,
            args0: [
                <ColorInputDefnition>{
                    type: "field_colour",
                    name: "col",
                    colour: "#ff0000",
                    colourOptions: [
                        "#ff0000",
                        "#ff8000",
                        "#ffff00",
                        "#ff9da5",
                        "#00ff00",
                        "#b09eff",
                        "#00ffff",
                        "#007fff",
                        "#65471f",
                        "#0000ff",
                        "#7f00ff",
                        "#ff0080",
                        "#ff00ff",
                        "#ffffff",
                        "#999999",
                        "#000000",
                    ],
                    columns: 4,
                },
            ],
            style: "math_blocks",
            output: "Color",
        },
    ]

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

    const mathBlocks: BlockDefinition[] = [
        {
            kind: "block",
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "A",
                    check: "Number",
                },
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
                        ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
                        ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
                        ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
                    ],
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "B",
                    check: "Number",
                },
            ],
            inputsInline: true,
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_ARITHMETIC_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
        {
            kind: "block",
            type: "jacdac_math_single",
            message0: "%1 %2",
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["-", "NEG"],
                        ["%{BKY_MATH_SINGLE_OP_ABSOLUTE}", "ABS"],
                    ],
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "NUM",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            helpUrl: "%{BKY_MATH_SINGLE_HELPURL}",
            extensions: ["math_op_tooltip"],
        },
        {
            kind: "block",
            type: "jacdac_math_random",
            message0: "random",
            args0: [],
            output: "Number",
            style: "math_blocks",
        },
        {
            kind: "block",
            type: "jacdac_math_random_range",
            message0: "random from %1 to %2",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "min",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "max",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
            inputsInline: true,
        },
        {
            kind: "block",
            type: "jacdac_math_clamp",
            message0: "clamp %1 in [%2, %3]",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "minInclusive",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "maxInclusive",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
        },
        {
            kind: "block",
            type: "jacdac_math_map",
            message0: "map %1 from [%2, %3] to [%4, %5]",
            args0: [
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "fromMax",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMin",
                    check: "Number",
                },
                <ValueInputDefinition>{
                    type: "input_value",
                    name: "toMax",
                    check: "Number",
                },
            ],
            output: "Number",
            style: "math_blocks",
        },
    ]

    const dslsBlocks = arrayConcatMany(
        dsls.map(dsl =>
            dsl?.createBlocks({ theme }).map(b => {
                b.dsl = dsl.id // ensure DSL is set
                return b
            })
        )
    )

    const blocks: BlockDefinition[] = [
        ...runtimeBlocks,
        ...shadowBlocks,
        ...mathBlocks,
        ...dslsBlocks,
    ]

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

    const logicCategory: CategoryDefinition = {
        kind: "category",
        name: "Logic",
        colour: "%{BKY_LOGIC_HUE}",
        contents: [
            {
                kind: "block",
                type: "dynamic_if",
            },
            {
                kind: "block",
                type: "logic_compare",
                values: {
                    A: { kind: "block", type: "math_number" },
                    B: { kind: "block", type: "math_number" },
                },
            },
            {
                kind: "block",
                type: "logic_operation",
                values: {
                    A: { kind: "block", type: "logic_boolean" },
                    B: { kind: "block", type: "logic_boolean" },
                },
            },
            {
                kind: "block",
                type: "logic_negate",
                values: {
                    BOOL: { kind: "block", type: "logic_boolean" },
                },
            },
            {
                kind: "block",
                type: "logic_boolean",
            },
        ],
    }

    const mathCategory: CategoryDefinition = {
        kind: "category",
        name: "Math",
        colour: "%{BKY_MATH_HUE}",
        contents: [
            {
                kind: "block",
                type: "jacdac_math_arithmetic",
                values: {
                    A: { kind: "block", type: "math_number" },
                    B: { kind: "block", type: "math_number" },
                },
            },
            {
                kind: "block",
                type: "jacdac_math_single",
                values: {
                    NUM: {
                        kind: "block",
                        type: "math_number",
                    },
                },
            },
            { kind: "block", type: "jacdac_math_random" },
            { kind: "block", type: "jacdac_math_random_range" },
            { kind: "block", type: "jacdac_math_map" },
            { kind: "block", type: "math_number" },
        ],
    }

    const variablesCategory: CategoryDefinition = {
        kind: "category",
        name: "Variables",
        colour: "%{BKY_VARIABLES_HUE}",
        custom: "VARIABLE",
    }

    const dslsCategories = arrayConcatMany(
        dsls.map(dsl =>
            dsl?.createCategory({ theme, source, program, liveServices })
        )
    )
        .filter(cat => !!cat)
        .sort((l, r) => -(l.order - r.order))

    console.log(`DSL categories`, dslsCategories)

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: [
            commandsCategory,
            logicCategory,
            mathCategory,
            variablesCategory,
            <SeparatorDefinition>{
                kind: "sep",
            },
            ...dslsCategories,
        ]
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
