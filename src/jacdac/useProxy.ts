import { Packet } from "../../jacdac-ts/src/jdom/packet"
import { useEffect } from "react"
import { ControlCmd, DEVICE_ANNOUNCE, SRV_CONTROL } from "../../jacdac-ts/src/jdom/constants"
import useBus from "./useBus"

/**
 * A hook to force brains into proxy mode.
 * @param force
 */
export default function useProxy(force: boolean) {
    const bus = useBus()
    useEffect(() => {
        if (!force) return

        const forceProxy = () => {
            const pkt = Packet.onlyHeader(ControlCmd.Proxy)
            pkt.sendAsMultiCommandAsync(bus, SRV_CONTROL)
        }
        const unsub = bus.subscribe(DEVICE_ANNOUNCE, forceProxy)
        forceProxy()
        return unsub
    }, [force])
}
