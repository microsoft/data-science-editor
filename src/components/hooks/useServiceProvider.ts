import { useContext } from "react"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { JDServiceProvider } from "../../../jacdac-ts/src/jdom/servers/serviceprovider"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useChange from "../../jacdac/useChange"

/**
 * Mounts a service provider
 */
export default function useServiceProvider<
    TServiceProvider extends JDServiceProvider
>(device: JDDevice) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const provider = useChange(
        bus,
        b => device && b.findServiceProvider(device.deviceId)
    )
    return provider as TServiceProvider
}
