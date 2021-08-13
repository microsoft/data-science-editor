import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import { deviceSpecificationFromProductIdentifier } from "../../jacdac-ts/src/jdom/spec"
import useChange from "./useChange"

export default function useDeviceSpecification(device: JDDevice) {
    const id = useChange(device, _ => _?.productIdentifier)
    const specification = deviceSpecificationFromProductIdentifier(id)
    return specification
}
