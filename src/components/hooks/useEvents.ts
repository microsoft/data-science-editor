import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import useServices from "./useServices"

export default function useEvents(options?: {
    serviceName?: string
    serviceClass?: number
    specification?: boolean
}) {
    const services = useServices(options)
    const events = arrayConcatMany(services.map(srv => srv.events))
    return events
}
