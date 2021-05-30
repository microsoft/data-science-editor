import { useEffect, useState } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"

export default function useEvent(service: JDService, identifier: number) {
    const [event, setEvent] = useState(service?.event(identifier))
    useEffect(() => setEvent(service?.event(identifier)), [service, identifier])
    return event
}
