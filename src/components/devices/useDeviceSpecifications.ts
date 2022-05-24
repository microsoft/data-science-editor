import { DeviceSpecificationOptions } from "../../../jacdac-ts/src/jdom/catalog"
import { arrayEq } from "../../../jacdac-ts/src/jdom/utils"
import useDeviceCatalog from "../../../react-jacdac/src/hooks/useDeviceCatalog"
import useChange from "../../jacdac/useChange"

export default function useDeviceSpecifications(
    options?: DeviceSpecificationOptions
) {
    const catalog = useDeviceCatalog()
    const specifications = useChange(
        catalog,
        _ => _?.specifications(options),
        [JSON.stringify(options)],
        (a, b) => arrayEq(a, b, (l, r) => l.id === r.id)
    )
    return specifications
}
