import { useEffect, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

export default function useRegister(service: JDService, identifier: number) {
    const [register, setRegister] = useState(service?.register(identifier))
    useEffect(
        () => setRegister(service?.register(identifier)),
        [service, identifier]
    )
    return register
}
