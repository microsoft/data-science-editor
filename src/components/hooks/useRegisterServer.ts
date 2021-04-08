import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import useServiceServer from "./useServiceServer";

export default function useRegisterServer(register: JDRegister) {
    const server = useServiceServer(register?.service);
    return server?.register(register?.code);
}