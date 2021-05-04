import { useEffect, useMemo, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import JDServiceServer from "../../../jacdac-ts/src/jdom/serviceserver"
import useServiceProvider from "./useServiceProvider"

export default function useServiceServer<T extends JDServiceServer>(
    service: JDService,
    createTwin?: () => T
) {
    const provider = useServiceProvider(service.device)
    const twin = useMemo<T>(() => createTwin?.(), [])
    useEffect(() => {
        if (!provider && twin) {
            //console.log(`set twin`, { twin, service })
            twin.twin = service
        }
        return () => {
            if (twin) {
                //console.log(`clean twin`, twin)
                twin.twin = undefined
            }
        }
    }, [service, provider])
    return (provider?.service(service?.serviceIndex) as T) || twin
}
