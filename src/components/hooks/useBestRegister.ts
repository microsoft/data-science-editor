import { useMemo } from "react"
import { SystemReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    isReading,
    isValue,
    isValueOrIntensity,
} from "../../../jacdac-ts/src/jdom/spec"
import { useServiceSpecification } from "../../jacdac/useServiceSpecification"

export default function useBestRegister(service: JDService) {
    const specification = useServiceSpecification(service)
    return useMemo(() => {
        const hasReading = specification?.packets.some(reg => isReading(reg))
        if (hasReading) return service.register(SystemReg.Reading)
        const hasValue = specification?.packets.some(reg => isValue(reg))
        if (hasValue) return service.register(SystemReg.Value)
        const hasIntensity = specification?.packets.some(reg =>
            isValueOrIntensity(reg)
        )
        if (hasIntensity) return service.register(SystemReg.Intensity)
        return undefined
    }, [service, specification])
}
