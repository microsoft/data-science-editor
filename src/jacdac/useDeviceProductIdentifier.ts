import JDDevice from "../../jacdac-ts/src/jdom/device"
import useChange from "./useChange"

export default function useDeviceProductIdentifier(device: JDDevice) {
    const id = useChange(device, _ => _?.productIdentifier)
    return id
}
