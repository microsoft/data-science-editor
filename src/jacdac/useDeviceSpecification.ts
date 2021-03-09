import { ControlReg } from "../../jacdac-ts/src/jdom/constants";
import { JDDevice } from "../../jacdac-ts/src/jdom/device";
import { deviceSpecificationFromFirmwareIdentifier } from "../../jacdac-ts/src/jdom/spec";
import { useRegisterIntValue } from "./useRegisterValue";

export default function useDeviceSpecification(device: JDDevice) {
    const firmwareIdentifierRegister = device?.service(0)?.register(ControlReg.FirmwareIdentifier);
    const firmwareIdentifier = useRegisterIntValue(firmwareIdentifierRegister);
    const specification = deviceSpecificationFromFirmwareIdentifier(firmwareIdentifier);
    return specification;
}
