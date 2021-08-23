import { useEffect, useState } from "react"
import JDService from "../../jacdac-ts/src/jdom/service"
import { JDServiceClient } from "../../jacdac-ts/src/jdom/serviceclient"

export default function useServiceClient<T extends JDServiceClient>(
    service: JDService,
    factory: (service: JDService) => T,
    deps: React.DependencyList = []
) {
    const [client, setClient] = useState<T>(undefined)

    useEffect(() => {
        const c = service && factory(service)
        setClient(c)
        return () => c?.unmount()
    }, [service, ...deps]) // don't use factory in cache!

    return client
}
