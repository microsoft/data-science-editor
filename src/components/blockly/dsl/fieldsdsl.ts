import { fieldShadows } from "../fields/fields"
import BlockDomainSpecificLanguage from "./dsl"

const fieldsDsl: BlockDomainSpecificLanguage = {
    id: "fields",
    createBlocks: () => fieldShadows(),
}
export default fieldsDsl
