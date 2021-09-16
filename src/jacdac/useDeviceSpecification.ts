import JDDevice from "../../jacdac-ts/src/jdom/device"
import { deviceSpecificationFromProductIdentifier } from "../../jacdac-ts/src/jdom/spec"
import useDeviceProductIdentifier from "./useDeviceProductIdentifier"

export default function useDeviceSpecification(device: JDDevice) {
    const id = useDeviceProductIdentifier(device)
    const specification = deviceSpecificationFromProductIdentifier(id)
    return specification
}
