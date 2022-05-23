import { ANNOUNCE } from "../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import useEventRaised from "./useEventRaised"

export default function useService(device: JDDevice, serviceIndex: number) {
    return useEventRaised(ANNOUNCE, device, _ => _?.service(serviceIndex), [
        serviceIndex,
    ])
}
