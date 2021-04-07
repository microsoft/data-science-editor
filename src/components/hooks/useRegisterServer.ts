import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import useServiceServer from "./useServiceServer";

export default function useRegisterServer(register: JDRegister) {
    const host = useServiceServer(register?.service);
    return host?.register(register?.code);
}