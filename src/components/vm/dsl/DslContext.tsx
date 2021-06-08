import React, { createContext, useMemo } from "react"
import toolsDSL from "./toolsdsl"
import azureIoTHubDSL from "./azureiothubdsl"
import BlockDomainSpecificLanguage from "./dsl"
import deviceTwinDSL from "./devicetwindsl"
import servicesDSL from "./servicesdsl"
import mathDSL from "./mathdsl"

export interface DslProps {
    dsls: BlockDomainSpecificLanguage[]
}

const DslContext = createContext<DslProps>({
    dsls: [],
})
DslContext.displayName = "DSL"

export default DslContext

// eslint-disable-next-line react/prop-types
export const DslProvider = ({ children }) => {
    const dsls = useMemo(
        () => [servicesDSL, azureIoTHubDSL, deviceTwinDSL, toolsDSL, mathDSL],
        []
    )
    return (
        <DslContext.Provider value={{ dsls }}>{children}</DslContext.Provider>
    )
}
