import BlockDomainSpecificLanguage from "./dsl"

const variablesDsl: BlockDomainSpecificLanguage = {
    id: "variables",
    types: ["variables_get", "variables_set"],
    createCategory: () => [
        {
            kind: "category",
            name: "Variables",
            colour: "%{BKY_VARIABLES_HUE}",
            custom: "VARIABLE",
        },
    ],
    compileExpressionToVM: ({ block, definition, blockToExpressionInner }) => {
        const { type } = block
        if (type === "variables_get") {
            // TODO compile variables_get
            console.log(`todo variables_get`)
        }
        return undefined
    },
    compileCommandToVM: ({ event, block, definition, blockToExpression }) => {
        const { type } = block
        if (type === "variables_set") {
            // TODO
            console.log(`todo variables_get`)
        }
        return undefined
    },
}
export default variablesDsl
