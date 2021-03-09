import { JDService } from "../../../jacdac-ts/src/jdom/service";
import ServiceHost from "../../../jacdac-ts/src/jdom/servicehost";
import useDeviceHost from "./useDeviceHost";

export default function useServiceHost<T extends ServiceHost>(service: JDService) {
    const host = useDeviceHost(service.device);
    return host?.service(service?.serviceIndex) as T;
}