import BlockDomainSpecificLanguage from "./dsl"

const variablesDsl: BlockDomainSpecificLanguage = {
    id: "variables",
    createCategory: () => [
        {
            kind: "category",
            name: "Variables",
            colour: "%{BKY_VARIABLES_HUE}",
            custom: "VARIABLE",
        },
    ],
}
export default variablesDsl
