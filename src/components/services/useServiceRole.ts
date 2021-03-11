import { useEffect, useState } from "react"
import { CHANGE, SRV_ROLE_MANAGER } from "../../../jacdac-ts/src/jdom/constants"
import { RoleManagerClient, RequestedRole } from "../../../jacdac-ts/src/jdom/rolemanagerclient"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useServices from "../hooks/useServices"
import useServiceClient from "../useServiceClient"

export default function useServiceRole(service: JDService) {
    const [roleManager] = useServices({ serviceClass: SRV_ROLE_MANAGER })
    const roleManagerClient = useServiceClient(
        roleManager,
        srv => new RoleManagerClient(srv)
    );
    const [role, setRole] = useState<RequestedRole>(roleManagerClient?.role(service));
    useEffect(() => roleManagerClient?.subscribe(CHANGE, () => {
        const r = roleManagerClient?.role(service);
        setRole(r);
    }), [roleManagerClient])

    return role;
}