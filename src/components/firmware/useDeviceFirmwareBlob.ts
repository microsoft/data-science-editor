import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"
import useDeviceFirmwareInfo from "./useDeviceFirmwareInfo"

export default function useDeviceFirmwareBlob(device: JDDevice) {
    const bus = useBus()
    const blobs = useChange(bus, _ => _.firmwareBlobs)
    const firmwareInfo = useDeviceFirmwareInfo(device)
    const blob =
        firmwareInfo &&
        blobs?.find(b => firmwareInfo.productIdentifier == b.productIdentifier)

    return blob
}
