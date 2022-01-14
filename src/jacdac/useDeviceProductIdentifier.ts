import { ControlReg } from "../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import useRegister from "../components/hooks/useRegister"
import { useRegisterUnpackedValue } from "./useRegisterValue"

export default function useDeviceProductIdentifier(device: JDDevice) {
    const reg = useRegister(device?.service(0), ControlReg.ProductIdentifier)
    const [id] = useRegisterUnpackedValue<[number]>(reg)
    return id
}
