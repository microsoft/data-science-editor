import { toIdentifier } from "../../../../jacdac-ts/src/vm/compile"
import JDomTreeField from "../fields/JDomTreeField"
import TwinField from "../fields/TwinField"
import WatchValueField from "../fields/WatchValueField"
import {
    BlockDefinition,
    BlockReference,
    InputDefinition,
    INSPECT_BLOCK,
    TWIN_BLOCK,
    VariableInputDefinition,
    WATCH_BLOCK,
} from "../toolbox"
import BlockDomainSpecificLanguage from "./dsl"
import servicesDSL from "./servicesdsl"

const colour = "#888"

const toolsDSL: BlockDomainSpecificLanguage = {
    id: "tools",
    createBlocks: () => [
        {
            kind: "block",
            type: TWIN_BLOCK,
            message0: `view %1 %2 %3`,
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "none",
                    variableTypes: [
                        "client",
                        ...servicesDSL.supportedServices.map(
                            service => service.shortId
                        ),
                    ],
                    defaultType: "client",
                },
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: TwinField.KEY,
                    name: "twin",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Twin of the selected service`,
            helpUrl: "",
            template: "meta",
        },
        {
            kind: "block",
            type: INSPECT_BLOCK,
            message0: `inspect %1 %2 %3`,
            args0: [
                <VariableInputDefinition>{
                    type: "field_variable",
                    name: "role",
                    variable: "none",
                    variableTypes: [
                        "client",
                        ...servicesDSL.supportedServices.map(
                            service => service.shortId
                        ),
                    ],
                    defaultType: "client",
                },
                {
                    type: "input_dummy",
                },
                <InputDefinition>{
                    type: JDomTreeField.KEY,
                    name: "twin",
                },
            ],
            colour,
            inputsInline: false,
            tooltip: `Inspect a service`,
            helpUrl: "",
            template: "meta",
        },
        {
            kind: "block",
            type: WATCH_BLOCK,
            message0: `watch %1 %2`,
            args0: [
                <InputDefinition>{
                    type: "input_value",
                    name: "value",
                    check: ["Number", "Boolean", "String"],
                },
                <InputDefinition>{
                    type: WatchValueField.KEY,
                    name: "watch",
                },
            ],
            colour,
            inputsInline: true,
            tooltip: `Watch a value in the editor`,
            helpUrl: "",
        },
    ],
    createCategory: () => [
        {
            kind: "category",
            name: "Tools",
            colour: colour,
            contents: [
                <BlockReference>{
                    kind: "block",
                    type: WATCH_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: TWIN_BLOCK,
                },
                <BlockReference>{
                    kind: "block",
                    type: INSPECT_BLOCK,
                },
            ],
        },
    ],

    compileEventToVM: ({ block, blockToExpression }) => {
        const { type } = block
        if (type === WATCH_BLOCK) {
            const { inputs } = block
            const { expr, errors } = blockToExpression(
                undefined,
                inputs[0].child
            )
            return {
                expression: <jsep.CallExpression>{
                    type: "CallExpression",
                    arguments: [expr],
                    callee: toIdentifier("watch"),
                },
                errors,
                meta: true,
            }
        }

        return undefined
    },
}

export default toolsDSL
