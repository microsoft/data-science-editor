import { useMemo } from "react"
import { serviceSpecificationFromClassIdentifier } from "../../jacdac-ts/src/jdom/spec"

export function useServiceSpecificationFromServiceClass(serviceClass: number) {
    const specification = useMemo(
        () => serviceSpecificationFromClassIdentifier(serviceClass),
        [serviceClass]
    )
    return specification
}
