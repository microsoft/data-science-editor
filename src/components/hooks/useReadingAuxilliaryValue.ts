import { useEffect, useState } from "react"
import { REPORT_UPDATE, SystemReg } from "../../../jacdac-ts/src/jdom/constants"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"

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
    const [value, setValue] = useState<number[]>(
        auxilliaryRegister?.unpackedValue
    )

    useEffect(() => {
        setValue(auxilliaryRegister?.unpackedValue)
        return (
            visible &&
            auxilliaryRegister?.subscribe(REPORT_UPDATE, () => {
                setValue(auxilliaryRegister?.unpackedValue)
            })
        )
    }, [register, auxilliaryRegister, visible])

    return value
}
