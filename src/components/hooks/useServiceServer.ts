import { useEffect, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import JDServiceServer from "../../../jacdac-ts/src/jdom/serviceserver"
import useServiceProvider from "./useServiceProvider"

export default function useServiceServer<T extends JDServiceServer>(
    service: JDService,
    createTwin?: () => T
) {
    const provider = useServiceProvider(service.device)
    const [twin, setTwin] = useState<T>(undefined)
    useEffect(() => {
        const t = !provider && createTwin?.()
        if (t) t.twin = service
        setTwin(t)
        return () => {
            if (t) t.twin = undefined
        }
    }, [service, provider])
    return (provider?.service(service?.serviceIndex) as T) || twin
}
