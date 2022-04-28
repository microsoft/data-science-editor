import { ControlReg } from "../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import useRegister from "../components/hooks/useRegister"
import useDeviceSpecification from "./useDeviceSpecification"
import { useRegisterUnpackedValue } from "./useRegisterValue"

export default function useDeviceDescription(device: JDDevice) {
    const specification = useDeviceSpecification(device)
    const reg = useRegister(device?.service(0), ControlReg.DeviceDescription)
    const [res] = useRegisterUnpackedValue<[string]>(reg)
    return res || specification?.name
}
