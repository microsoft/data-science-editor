import { JDService } from "../../jacdac-ts/src/jdom/service"
import { useMemo } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"

export function useServiceSpecificationFromServiceClass(serviceClass: number) {
    const specification = useMemo(
        () => serviceSpecificationFromClassIdentifier(serviceClass),
        [serviceClass]
    )
    return specification
}

export function useServiceSpecification(service: JDService) {
    const serviceClass = service?.serviceClass
    const specification = useServiceSpecificationFromServiceClass(serviceClass)
    return specification
}
