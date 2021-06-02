import { ControlReg } from "../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import { deviceSpecificationFromFirmwareIdentifier } from "../../jacdac-ts/src/jdom/spec"
import useChange from "./useChange"
import { useRegisterUnpackedValue } from "./useRegisterValue"

export default function useDeviceSpecification(device: JDDevice) {
    const firmwareIdentifierRegister = useChange(device, _ =>
        device?.service(0)?.register(ControlReg.FirmwareIdentifier)
    )
    const [firmwareIdentifier] = useRegisterUnpackedValue<[number]>(
        firmwareIdentifierRegister
    )
    const specification =
        deviceSpecificationFromFirmwareIdentifier(firmwareIdentifier)
    return specification
}
