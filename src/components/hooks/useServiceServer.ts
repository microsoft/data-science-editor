import { useMemo } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { JDServiceServer } from "../../../jacdac-ts/src/jdom/servers/serviceserver"
import useServiceProvider from "./useServiceProvider"

export default function useServiceServer<T extends JDServiceServer>(
    service: JDService,
    createTwin?: () => T
) {
    const device = service?.device
    const provider = useServiceProvider(device)
    const twin = useMemo<T>(() => {
        if (provider) return undefined
        let twin = service?.twin as T
        if (!twin && service && createTwin) {
            twin = createTwin()
            if (twin) service.twin = twin
        }
        return twin
    }, [device, provider, service?.changeId])
    return (provider?.service(service?.serviceIndex) as T) || twin
}
