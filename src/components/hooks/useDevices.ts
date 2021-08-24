import { DependencyList, useContext } from "react"
import DeviceFilter from "../../../jacdac-ts/src/jdom/filters/devicefilter"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"

export default function useDevices(
    options?: DeviceFilter,
    deps: DependencyList = []
) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const devices = useChange(bus, _ => _?.devices(options) || [], [
        JSON.stringify(options),
        ...deps,
    ])
    return devices
}
