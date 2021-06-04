import { useMemo } from "react"
import { WorkspaceJSON } from "../vm/jsongenerator"
import {
    BlockDefinition,
    CategoryDefinition,
    OptionsInputDefinition,
    ServiceBlockDefinitionFactory,
    ToolboxConfiguration,
} from "../vm/toolbox"
import Blockly from "blockly"

function loadBlocks() {
    // declare all block types here
    const blocks: BlockDefinition[] = [
        {
            kind: "block",
            type: "jacdac_math_arithmetic",
            message0: "%1 %2 %3",
            args0: [
                {
                    type: "input_value",
                    name: "A",
                    check: "Number",
                },
                {
                    type: "field_dropdown",
                    name: "OP",
                    options: [
                        ["%{BKY_MATH_ADDITION_SYMBOL}", "ADD"],
                        ["%{BKY_MATH_SUBTRACTION_SYMBOL}", "MINUS"],
                        ["%{BKY_MATH_MULTIPLICATION_SYMBOL}", "MULTIPLY"],
                        ["%{BKY_MATH_DIVISION_SYMBOL}", "DIVIDE"],
                    ],
                } as OptionsInputDefinition,
                {
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
        } as BlockDefinition,
    ]

    // re-register blocks with blocklys
    blocks.forEach(
        block =>
            (Blockly.Blocks[block.type] = {
                jacdacDefinition: block,
                init: function () {
                    this.jsonInit(block)
                },
            } as ServiceBlockDefinitionFactory)
    )
}

export default function useToolbox(source: WorkspaceJSON) {
    const table = [
        {
            name: "x",
        },
        {
            name: "y",
        },
    ]

    useMemo(() => loadBlocks(), [table])

    const toolboxConfiguration: ToolboxConfiguration = {
        kind: "categoryToolbox",
        contents: [
            {
                kind: "category",
                name: "Mathsdfasfs",
                contents: [
                    {
                        kind: "block",
                        type: "jacdac_math_arithmetic",
                    } as BlockDefinition,
                    {
                        kind: "block",
                        type: "jacdac_math_arithmetic",
                    } as BlockDefinition,
                ],
            } as CategoryDefinition,
            {
                kind: "category",
                name: "Yay",
                contents: [{ kind: "block", type: "math_arithmetic" }],
            },
        ],
    }
    // todo
    return {
        toolboxConfiguration,
    }
}
