import { createContext } from "react"
import { JDBus } from "../../jacdac-ts/src/jdom/bus"
export interface JacdacContextProps {
    bus: JDBus
}

const JacdacContext = createContext<JacdacContextProps>({
    bus: undefined,
})
JacdacContext.displayName = "Jacdac"

export default JacdacContext
