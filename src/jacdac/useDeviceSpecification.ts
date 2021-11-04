import JDDevice from "../../jacdac-ts/src/jdom/device"
import useDeviceProductIdentifier from "./useDeviceProductIdentifier"
import useChange from "./useChange"
import useDeviceCatalog from "../components/devices/useDeviceCatalog"

export default function useDeviceSpecification(device: JDDevice) {
    const deviceCatalog = useDeviceCatalog()
    const id = useDeviceProductIdentifier(device)
    const specification = useChange(
        deviceCatalog,
        _ => _.specificationFromProductIdentifier(id),
        [id]
    )
    return specification
}
