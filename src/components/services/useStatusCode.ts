import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    RegisterOptions,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"

export default function useStatusCode(
    service: JDService,
    options?: RegisterOptions
) {
    const register = useRegister(service, SystemReg.StatusCode)
    const [code = 0, vendorCode = 0] = useRegisterUnpackedValue<[number, number]>(
        register,
        options
    )
    return { code, vendorCode }
}
