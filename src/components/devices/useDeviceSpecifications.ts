import { DeviceSpecificationOptions } from "../../../jacdac-ts/src/jdom/catalog"
import { arrayEq } from "../../../jacdac-ts/src/jdom/utils"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function useDeviceSpecifications(
    options?: DeviceSpecificationOptions
) {
    const bus = useBus()
    const specifications = useChange(
        bus.deviceCatalog,
        _ => _?.specifications(options),
        [JSON.stringify(options)],
        (a, b) => arrayEq(a, b, (l, r) => l.id === r.id)
    )
    return specifications
}
