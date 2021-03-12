import { useContext, useEffect, useState } from "react"
import { BusRoleManagerClient } from "../../../jacdac-ts/src/jdom/bus";
import { ROLE_MANAGER_CHANGE } from "../../../jacdac-ts/src/jdom/constants";
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context";

export default function useRoleManager() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext);
    const [mgr, setMgr] = useState<BusRoleManagerClient>(bus.roleManager);
    useEffect(() => bus.subscribe(ROLE_MANAGER_CHANGE, () => setMgr(bus.roleManager)))
    return mgr;
}