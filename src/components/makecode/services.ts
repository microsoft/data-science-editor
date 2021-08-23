import makecodeServicesData from "../../../jacdac-ts/jacdac-spec/services/makecode-extensions.json"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"

export function makeCodeServices(): jdspec.MakeCodeServiceInfo[] {
    return (makecodeServicesData as jdspec.MakeCodeServiceInfo[]).slice(0)
}

export function resolveMakecodeService(service: jdspec.ServiceSpec) {
    return (
        service &&
        (makecodeServicesData as jdspec.MakeCodeServiceInfo[]).find(
            mk => mk.service === service.shortId
        )
    )
}

export function resolveMakecodeServiceFromClassIdentifier(
    serviceClass: number
) {
    const srv = serviceSpecificationFromClassIdentifier(serviceClass)
    return srv && resolveMakecodeService(srv)
}
