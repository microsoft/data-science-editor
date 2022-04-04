import { ROLE_CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useEventRaised from "../../jacdac/useEventRaised"

export default function useServiceRole(service: JDService): URL {
    const role = useEventRaised(ROLE_CHANGE, service, _ => _?.role)
    if (!role) return undefined
    try {
        const uri = new URL(role)
        return uri
    } catch (e) {
        console.debug(e)
        return undefined
    }
}
