import { DependencyList } from "react"
import { DeviceFilter } from "../../../jacdac-ts/src/jdom/filters/devicefilter"
import { ServiceFilter } from "../../../jacdac-ts/src/jdom/filters/servicefilter"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function useServices(
    options?: ServiceFilter & DeviceFilter,
    deps: DependencyList = []
) {
    const bus = useBus()
    const services = useChange(bus, _ => _.services(options), [
        JSON.stringify(options),
        ...deps,
    ])
    return services
}
