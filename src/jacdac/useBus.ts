import { useContext, useEffect } from "react"
import { JDBus } from "../../jacdac-ts/src/jdom/bus"
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

/**
 * Grabs the Jacdac singleton bus from the current Jacdac context and configures it.
 * Throws an error if bus is missing.
 */
export function useBusMode(options: {
    passive?: boolean
    streaming?: boolean
    autoConnect?: boolean
}): JDBus {
    const { autoConnect, passive, streaming } = options
    const bus = useBus()

    // enable auto-connect if needed
    useEffect(() => {
        const unsubs: (() => void)[] = []
        if (streaming) {
            bus.streaming = true
            unsubs.push(() => {
                bus.streaming = false
            })
        }
        if (passive) {
            bus.passive = true
            unsubs.push(() => {
                bus.passive = false
            })
        }
        if (autoConnect) {
            bus.autoConnect = true
            unsubs.push(() => {
                bus.autoConnect = false
            })
        }
        return () => unsubs.forEach(unsub => unsub())
    }, [autoConnect, passive, streaming])

    return bus
}
