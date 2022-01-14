import { useMemo } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

export default function useEvent(service: JDService, identifier: number) {
    return useMemo(() => service?.event(identifier), [service, identifier])
}
