import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import useServiceHost from "./useServiceHost";

export default function useRegisterHost(register: JDRegister) {
    const host = useServiceHost(register?.service);
    return host?.register(register?.code);
}