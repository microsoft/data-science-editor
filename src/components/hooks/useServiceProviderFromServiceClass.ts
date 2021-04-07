import { useContext, useEffect } from "react"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function useServiceProviderFromServiceClass(
    serviceClass: number
): void {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)

    // run once
    useEffect(() => {
        const devices = bus.devices({ serviceClass })
        const def =
            !devices.length && serviceProviderDefinitionFromServiceClass(serviceClass)
        const host = def && addServiceProvider(bus, def)
        return () => bus.removeServiceProvider(host)
    }, [serviceClass])
}
