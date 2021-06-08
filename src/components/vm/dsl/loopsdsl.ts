import {
    BlockDefinition,
    CategoryDefinition,
    CODE_STATEMENT_TYPE,
    InputDefinition,
    REPEAT_EVERY_BLOCK,
    SeparatorDefinition,
    ValueInputDefinition,
    WAIT_BLOCK,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"

const colour = "#4fbac9"
const loopsDsl: BlockDomainSpecificLanguage = {
    id: "loops",
    createBlocks: () => [
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
            colour,
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
            colour,
            inputsInline: true,
            tooltip: `Repeats code at a given interval in seconds`,
            helpUrl: "",
            template: "every",
            nextStatement: CODE_STATEMENT_TYPE,
        },
    ],

    createCategory: () => [
        <SeparatorDefinition>{
            kind: "sep",
        },
        <CategoryDefinition>{
            kind: "category",
            name: "Commands",
            order: 4,
            colour,
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
        },
    ],
}
export default loopsDsl
