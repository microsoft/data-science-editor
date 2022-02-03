import { JDDevice } from "../../jacdac-ts/src/jdom/device"
import useDeviceProductIdentifier from "./useDeviceProductIdentifier"
import useChange from "./useChange"
import useDeviceCatalog from "../components/devices/useDeviceCatalog"

export default function useDeviceSpecification(device: JDDevice) {
    const id = useDeviceProductIdentifier(device)
    return useDeviceSpecificationFromProductIdentifier(id)
}

export function useDeviceSpecificationFromProductIdentifier(id: number) {
    const deviceCatalog = useDeviceCatalog()
    const specification = useChange(
        deviceCatalog,
        _ => _.specificationFromProductIdentifier(id),
        [id]
    )
    return specification
}

export function useDeviceSpecificationFromIdentifier(id: string) {
    const deviceCatalog = useDeviceCatalog()
    const specification = useChange(
        deviceCatalog,
        _ => _.specificationFromIdentifier(id),
        [id]
    )
    return specification
}
