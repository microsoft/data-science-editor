import { useContext } from "react"
import JDBus from "../../jacdac-ts/src/jdom/bus"
import JacdacContext, { JacdacContextProps } from "./Context"

/**
 * Grabs the Jacdac singleton bus from the current Jacdac context.
 * Throws an error if bus is missing.
 */
export default function useBus(): JDBus {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    if (!bus) throw Error("Jacdac bus missing in context")
    return bus
}
