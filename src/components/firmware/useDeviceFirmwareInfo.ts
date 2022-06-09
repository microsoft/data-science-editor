import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import useChange from "../../jacdac/useChange"

export default function useDeviceFirmwareInfo(device: JDDevice) {
    const firmwareInfo = useChange(
        device,
        _ => _?.firmwareInfo,
        undefined,
        (a, b) =>
            !!a == !!b &&
            (!a ||
                (a.deviceId === b.deviceId &&
                    a.version === b.version &&
                    a.productIdentifier === b.productIdentifier &&
                    a.bootloaderProductIdentifier ==
                        b.bootloaderProductIdentifier))
    )

    return firmwareInfo
}
