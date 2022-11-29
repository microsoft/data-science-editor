import JacscriptManagerChipItems from "./JacscriptManagerChipItems"
import RolesToolbar from "../roles/RolesToolbar"
import React from "react"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import useBus from "../../jacdac/useBus"
import { resolveRoleService, Role } from "../../../jacdac-ts/src/jacdac"

export default function JacscriptToolbar() {
    const bus = useBus()

    // start role on demand
    const handleRoleClick = (role: Role) => {
        const service = resolveRoleService(bus, role)
        // spin off simulator
        // TODO: preferred device id
        if (!service) {
            const { serviceClass } = role
            addServiceProvider(
                bus,
                serviceProviderDefinitionFromServiceClass(serviceClass)
            )
        }
    }

    return (
        <RolesToolbar onRoleClick={handleRoleClick}>
            <JacscriptManagerChipItems />
        </RolesToolbar>
    )
}
