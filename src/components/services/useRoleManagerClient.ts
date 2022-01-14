import { useEffect, useState } from "react"
import { ROLE_MANAGER_CHANGE } from "../../../jacdac-ts/src/jdom/constants"
import { RoleManagerClient } from "../../../jacdac-ts/src/jdom/clients/rolemanagerclient"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import useBus from "../../jacdac/useBus"

export default function useRoleManagerClient(): RoleManagerClient {
    const bus = useBus()
    const [mgr, setMgr] = useState<RoleManagerClient>(bus.roleManager)
    useEffect(
        () => bus.subscribe(ROLE_MANAGER_CHANGE, () => setMgr(bus.roleManager)),
        [bus]
    )
    return mgr
}
