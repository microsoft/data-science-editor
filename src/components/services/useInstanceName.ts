import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import JDService from "../../../jacdac-ts/src/jdom/service"
import {
    RegisterOptions,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"

export default function useInstanceName(
    service: JDService,
    options?: RegisterOptions
) {
    const instanceNameRegister = useRegister(service, SystemReg.InstanceName)
    const [instanceName] = useRegisterUnpackedValue<[number]>(
        instanceNameRegister,
        options
    )
    return instanceName
}
