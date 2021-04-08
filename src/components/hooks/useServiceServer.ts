import { JDService } from "../../../jacdac-ts/src/jdom/service";
import JDServiceServer from "../../../jacdac-ts/src/jdom/serviceserver";
import useServiceProvider from "./useServiceProvider";

export default function useServiceServer<T extends JDServiceServer>(service: JDService) {
    const provider = useServiceProvider(service.device);
    return provider?.service(service?.serviceIndex) as T;
}