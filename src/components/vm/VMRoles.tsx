import React, { useContext, useEffect, useState } from "react"
import { Chip, Grid, Tooltip } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4ProgramRunner } from "../../../jacdac-ts/src/vm/vmrunner"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DeviceAvatar from "../devices/DeviceAvatar"
import { serviceSpecificationFromName } from "../../../jacdac-ts/src/jdom/spec"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import AddIcon from "@material-ui/icons/Add"
import { ROLES_CHANGE } from "../../../jacdac-ts/src/vm/utils"

export default function VMRoles(props: { runner: IT4ProgramRunner }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { runner } = props
    const [roles, setRoles] = useState(runner?.roles)

    useEffect(
        () =>
            runner?.subscribe(ROLES_CHANGE, () => {
                const newRoles = runner?.roles
                console.log("vm role", newRoles)
                setRoles(newRoles)
            }),
        [runner]
    )
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
