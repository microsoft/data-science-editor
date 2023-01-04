import { Block } from "blockly"
import {
    ColorInputDefinition,
    NumberInputDefinition,
    OptionsInputDefinition,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const builtins: Record<string, (block: Block) => string | number | boolean> = {
    jacdac_on_off: block => block.getFieldValue("value") === "on",
    jacdac_yes_no: block => block.getFieldValue("value") === "on",
    jacdac_time_picker: block => Number(block.getFieldValue("value") || "0"),
    jacdac_time_picker_ms: block => Number(block.getFieldValue("value") || "0"),
    jacdac_percent: block => Number(block.getFieldValue("value") || "0"),
    jacdac_ratio: block => Number(block.getFieldValue("value") || "0"),
    jacdac_byte: block => Number(block.getFieldValue("value") || "0"),
}

const shadowDsl: BlockDomainSpecificLanguage = {
    id: "shadow",
    createBlocks: () => [
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
                        ["1s", "1"],
                        ["0.1s", "0.1"],
                        ["0.5s", "0.5"],
                        ["5s", "5"],
                        ["15s", "15"],
                        ["30s", "30"],
                        ["1min", "60"],
                    ],
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
        {
            kind: "block",
            type: `jacdac_time_picker_ms`,
            message0: `%1`,
            args0: [
                <OptionsInputDefinition>{
                    type: "field_dropdown",
                    name: "value",
                    options: [
                        ["1s", "1000"],
                        ["0.1s", "100"],
                        ["0.5s", "500"],
                        ["5s", "5000"],
                        ["15s", "15000"],
                        ["30s", "30000"],
                    ],
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
                    precision: 5,
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
                    precision: 5,
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
                    precision: 0.01,
                },
            ],
            style: "math_blocks",
            output: "Number",
        },
    ],

    blockToValue: block => builtins[block.type]?.(block),
}
export default shadowDsl
