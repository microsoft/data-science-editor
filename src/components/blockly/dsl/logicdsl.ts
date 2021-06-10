import BlockDomainSpecificLanguage from "./dsl"

const logicDsl: BlockDomainSpecificLanguage = {
    id: "logic",
    createCategory: () => [
        {
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
        },
    ],
}
export default logicDsl
