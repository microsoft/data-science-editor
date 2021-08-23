import { useMemo } from "react"
import JDService from "../../../jacdac-ts/src/jdom/service"
import JDServiceServer from "../../../jacdac-ts/src/jdom/serviceserver"
import useServiceProvider from "./useServiceProvider"

export default function useServiceServer<T extends JDServiceServer>(
    service: JDService,
    createTwin?: () => T
) {
    const provider = useServiceProvider(service?.device)
    const twin = useMemo<T>(() => {
        if (provider) return undefined
        let twin = service?.twin as T
        if (!twin && service && createTwin) {
            twin = createTwin()
            if (twin) service.twin = twin
        }
        return twin
    }, [service, provider, service?.changeId])
    return (provider?.service(service?.serviceIndex) as T) || twin
}
