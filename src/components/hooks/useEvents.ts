import { SystemEvent } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "./useServices"

export default function useEvents(options?: {
    serviceName?: string
    serviceClass?: number
    specification?: boolean
    ignoreChange?: boolean
}) {
    const { ignoreChange } = options || {}
    const services = useServices(options)
    let events = arrayConcatMany(services.map(srv => srv.events))
    if (ignoreChange)
        events = events.filter(
            ev =>
                ev.code !== SystemEvent.StatusCodeChanged &&
                ev.code !== SystemEvent.Change
        )
    return events
}
