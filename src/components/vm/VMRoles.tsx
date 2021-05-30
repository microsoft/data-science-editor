import React, { useContext } from "react"
import { Chip, Grid, Tooltip } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DeviceAvatar from "../devices/DeviceAvatar"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import AddIcon from "@material-ui/icons/Add"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import useChange from "../../jacdac/useChange"

export default function VMRoles(props: { roleManager: RoleManager }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { roleManager } = props
    const roles = useChange(roleManager, _ => _?.roles)
    const handleRoleClick =
        (role: string, service: JDService, specification: jdspec.ServiceSpec) =>
        () => {
            if (!service && specification) {
                addServiceProvider(
                    bus,
                    serviceProviderDefinitionFromServiceClass(
                        specification.classIdentifier
                    )
                )
            } else {
                // do nothing
            }
        }

    return (
        <Grid container spacing={1}>
            {roles &&
                Object.keys(roles)
                    .map(role => ({
                        role,
                        service: roles[role].service,
                        specification: serviceSpecificationFromName(
                            roles[role].serviceShortId
                        ),
                    }))
                    .map(({ role, service, specification }) => (
                        <Grid item key={role}>
                            <Tooltip
                                title={
                                    service
                                        ? `bound to ${service.device.friendlyName}`
                                        : `start simulator`
                                }
                            >
                                <Chip
                                    label={role}
                                    variant={service ? "default" : "outlined"}
                                    avatar={
                                        service ? (
                                            <DeviceAvatar
                                                device={service.device}
                                            />
                                        ) : (
                                            <AddIcon />
                                        )
                                    }
                                    onClick={handleRoleClick(
                                        role,
                                        service,
                                        specification
                                    )}
                                />
                            </Tooltip>
                        </Grid>
                    ))}
        </Grid>
    )
}
