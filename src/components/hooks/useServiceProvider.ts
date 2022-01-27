import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { JDServiceProvider } from "../../../jacdac-ts/src/jdom/servers/serviceprovider"
import useBus from "../../jacdac/useBus"
import useChange from "../../jacdac/useChange"

/**
 * Mounts a service provider
 */
export default function useServiceProvider<
    TServiceProvider extends JDServiceProvider
>(device: JDDevice) {
    const bus = useBus()
    const provider = useChange(
        bus,
        b => device && b.findServiceProvider(device.deviceId),
        [device]
    )
    return provider as TServiceProvider
}
