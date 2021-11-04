import {
    deviceCatalog,
    DeviceSpecificationOptions,
} from "../../../jacdac-ts/src/jdom/catalog"
import useChange from "../../jacdac/useChange"
export default function useDeviceSpecifications(
    options?: DeviceSpecificationOptions
) {
    const specifications = useChange(
        deviceCatalog,
        _ => _.specifications(options),
        [JSON.stringify(options)]
    )
    return specifications
}
