import { useContext } from "react";
import { JDDevice } from "../../../jacdac-ts/src/jdom/device";
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";
import useChange from "../../jacdac/useChange";

/**
 * Mounts a device host
 * @param device 
 * @param factory 
 */
export default function useDeviceHost(device: JDDevice) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext);
    const host = useChange(bus, b => device && b.deviceHost(device.deviceId));
    return host;
}