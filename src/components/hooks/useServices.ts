import { useContext } from "react"
import { DeviceFilter, ServiceFilter } from "../../../jacdac-ts/src/jdom/bus"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"

export default function useServices(options?: ServiceFilter & DeviceFilter) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const services = useChange(bus, _ => _?.services(options) || [], [
        JSON.stringify(options),
    ])
    return services
}
