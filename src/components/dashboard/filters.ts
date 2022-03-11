import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { isReading, isValueOrIntensity } from "../../../jacdac-ts/src/jdom/spec"
import { strcmp } from "../../../jacdac-ts/src/jdom/utils"

export function defaultDeviceSort(l: JDDevice, r: JDDevice): number {
    const srvScore = (srv: jdspec.ServiceSpec) =>
        srv.packets.reduce(
            (prev, pkt) =>
                prev + (isReading(pkt) ? 10 : isValueOrIntensity(pkt) ? 1 : 0),
            0
        ) || 0
    const score = (srvs: jdspec.ServiceSpec[]) =>
        srvs.reduce((prev, srv) => srvScore(srv), 0)

    const ls = score(
        l
            .services()
            .slice(1)
            .map(srv => srv.specification)
            .filter(spec => !!spec)
    )
    const rs = score(
        r
            .services()
            .slice(1)
            .map(srv => srv.specification)
            .filter(spec => !!spec)
    )
    if (ls !== rs) return -ls + rs
    return strcmp(l.deviceId, r.deviceId)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defaultDeviceFilter(d: JDDevice): boolean {
    return true
}
