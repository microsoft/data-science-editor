import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import RolesToolbar from "../roles/RolesToolbar"
import React, { useEffect } from "react"
import useJacscript from "./JacscriptContext"
import useRoleManager from "../hooks/useRoleManager"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import {
    LiveRoleBinding,
    RoleBinding,
} from "../../../jacdac-ts/src/jdom/rolemanager"
import useBus from "../../jacdac/useBus"

export default function JacscriptToolbar() {
    const bus = useBus()
    const { compiled } = useJacscript()
    const roleManager = useRoleManager()

    // update roles
    useEffect(() => {
        compiled?.dbg?.roles &&
            roleManager?.updateRoles([
                ...compiled.dbg.roles.map(r => ({
                    role: r.name,
                    serviceClass: r.serviceClass,
                })),
            ])
    }, [roleManager, compiled])

    // start role on demand
    const handleRoleClick = (role: RoleBinding) => {
        const { service, preferredDeviceId, serviceClass } =
            role as LiveRoleBinding
        // spin off simulator
        if (!service && !preferredDeviceId) {
            addServiceProvider(
                bus,
                serviceProviderDefinitionFromServiceClass(serviceClass)
            )
        }
    }

    return (
        <RolesToolbar roleManager={roleManager} onRoleClick={handleRoleClick}>
            <JacscriptManagerChipItems />
        </RolesToolbar>
    )
}
