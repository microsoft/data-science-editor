import { ControlReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JD_SERVICE_INDEX_CTRL } from "../../../jacdac-ts/src/jdom/constants"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useRegister from "../components/hooks/useRegister"
import { useRegisterUnpackedValue } from "./useRegisterValue"

export default function useDeviceDescription(device: JDDevice) {
    const reg = useRegister(device?.service(JD_SERVICE_INDEX_CTRL), ControlReg.DeviceDescription)
    const [res] = useRegisterUnpackedValue<[string]>(reg)
    return res
}
