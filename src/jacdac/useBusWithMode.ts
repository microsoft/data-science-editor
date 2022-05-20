import { useEffect } from "react"
import useBus from "./useBus"

/**
 * Grabs the Jacdac singleton bus from the current Jacdac context and configures it.
 * Throws an error if bus is missing.
 */
export default function useBusWithMode(options: {
    passive?: boolean
    streaming?: boolean
    autoConnect?: boolean
}) {
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
