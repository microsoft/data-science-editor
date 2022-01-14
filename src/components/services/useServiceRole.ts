import { ROLE_CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useEventRaised from "../../jacdac/useEventRaised"

export default function useServiceRole(service: JDService) {
    return useEventRaised(ROLE_CHANGE, service, _ => _?.role)
}
