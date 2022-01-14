import { useEffect } from "react"
import {
    ControlCmd,
    DEVICE_ANNOUNCE,
    SRV_CONTROL,
} from "../../../jacdac-ts/src/jdom/constants"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
import useBus from "../../jacdac/useBus"

export default function useForceProxy(proxy: boolean) {
    const bus = useBus()

    // put brains into proxy mode
    useEffect(() => {
        if (!proxy) return () => {}
        const forceProxy = () => {
            console.debug(`jacdac: force clients to proxy mode`)
            const pkt = Packet.onlyHeader(ControlCmd.Proxy)
            pkt.sendAsMultiCommandAsync(bus, SRV_CONTROL)
        }
        const unsub = bus.subscribe(DEVICE_ANNOUNCE, forceProxy)
        forceProxy()
        return unsub
    }, [proxy])
}
