import { useContext } from "react"
import { DeviceFilter } from "../../../jacdac-ts/src/jdom/filters/devicefilter"
import { ServiceFilter } from "../../../jacdac-ts/src/jdom/filters/servicefilter"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"

export default function useServices(options?: ServiceFilter & DeviceFilter) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const services = useChange(bus, _ => _?.services(options) || [], [
        JSON.stringify(options),
    ])
    return services
}
