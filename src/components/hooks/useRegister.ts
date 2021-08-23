import { useMemo } from "react"
import JDService from "../../../jacdac-ts/src/jdom/service"

export default function useRegister(service: JDService, identifier: number) {
    return useMemo(() => service?.register(identifier), [service, identifier])
}
