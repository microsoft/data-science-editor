import { useState } from "react"
import { SRV_ROLE_MANAGER } from "../../../jacdac-ts/src/jdom/constants"
import { RoleManagerClient, RequestedRole } from "../../../jacdac-ts/src/jdom/rolemanagerclient"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useChange from "../../jacdac/useChange"
import useServices from "../hooks/useServices"
import useServiceClient from "../useServiceClient"

export default function useServiceRole(service: JDService) {
    const [roleManager] = useServices({ serviceClass: SRV_ROLE_MANAGER })
    const roleManagerClient = useServiceClient(
        roleManager,
        srv => new RoleManagerClient(srv)
    );
    const [role, setRole] = useState<RequestedRole>(roleManagerClient?.role(service));
    useChange(roleManagerClient, client => setRole(client?.role(service)))

    return role;
}
