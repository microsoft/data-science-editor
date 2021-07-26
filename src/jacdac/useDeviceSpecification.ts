import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import { deviceSpecificationFromFirmwareIdentifier } from "../../jacdac-ts/src/jdom/spec"
import useChange from "./useChange"

export default function useDeviceSpecification(device: JDDevice) {
    const firmwareIdentifier = useChange(device, _ => _?.firmwareIdentifier)
    const specification =
        deviceSpecificationFromFirmwareIdentifier(firmwareIdentifier)
    return specification
}
