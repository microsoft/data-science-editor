import { DependencyList } from "react"
import { DeviceFilter } from "../../../jacdac-ts/src/jdom/filters/devicefilter"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function useDevices(
    options?: DeviceFilter,
    deps: DependencyList = []
) {
    const bus = useBus()
    // although devices returns a new array on each query
    // device instances are memoized
    const devices = useChange(bus, _ => _.devices(options), [
        JSON.stringify(options),
        ...deps,
    ])
    return devices
}
