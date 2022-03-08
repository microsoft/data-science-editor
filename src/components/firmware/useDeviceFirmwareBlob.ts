import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

export default function useDeviceFirmwareBlob(device: JDDevice) {
    const bus = useBus()
    const blobs = useChange(bus, _ => _.firmwareBlobs)
    const firmwareInfo = useChange(device, d => d.firmwareInfo)
    const blob =
        firmwareInfo &&
        blobs?.find(b => firmwareInfo.productIdentifier == b.productIdentifier)

    return blob
}
