import { useEffect } from "react"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import useBus from "../../jacdac/useBus"

export default function useServiceProviderFromServiceClass(
    serviceClass: number
): void {
    const bus = useBus()

    // run once
    useEffect(() => {
        const devices = bus.devices({ serviceClass })
        const def =
            !devices.length &&
            serviceProviderDefinitionFromServiceClass(serviceClass)
        const provider = def && addServiceProvider(bus, def)
        return () => bus.removeServiceProvider(provider)
    }, [serviceClass])
}
