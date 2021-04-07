import { JDService } from "../../../jacdac-ts/src/jdom/service";
import JDServiceServer from "../../../jacdac-ts/src/jdom/serviceserver";
import useServiceProvider from "./useServiceProvider";

export default function useServiceServer<T extends JDServiceServer>(service: JDService) {
    const host = useServiceProvider(service.device);
    return host?.service(service?.serviceIndex) as T;
}