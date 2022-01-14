import { DependencyList } from "react"
import { DeviceFilter } from "../../../jacdac-ts/src/jdom/filters/devicefilter"
import useDevices from "./useDevices"

export default function useDeviceCount(
    options?: DeviceFilter,
    deps?: DependencyList
) {
    const devices = useDevices(options, deps)
    return devices.length
}
