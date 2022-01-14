import { SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"

export default function useReadingAuxilliaryValue(
    register: JDRegister,
    identifier: number = SystemReg.ReadingError |
        SystemReg.ReadingResolution |
        SystemReg.MaxReading |
        SystemReg.MinReading |
        SystemReg.MinValue |
        SystemReg.MaxValue |
        SystemReg.StreamingInterval |
        SystemReg.StreamingPreferredInterval,
    options?: { visible?: boolean }
): number[] {
    const { service, code } = register || {}
    const { visible } = options || { visible: true }
    const reading = code === SystemReg.Reading || code === SystemReg.Value
    const auxilliaryRegister =
        reading && identifier ? service.register(identifier) : undefined
    return useRegisterUnpackedValue<[number]>(auxilliaryRegister, { visible })
}
