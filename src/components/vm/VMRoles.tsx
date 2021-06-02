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
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import useChange from "../../jacdac/useChange"
import { BlockSvg, FieldVariable, WorkspaceSvg } from "blockly"
import { TWIN_BLOCK } from "./toolbox"

export default function VMRoles(props: {
    roleManager: RoleManager
    workspace?: WorkspaceSvg
}) {
    const { roleManager, workspace } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const roles = useChange(roleManager, _ => _?.roles)
    const handleRoleClick =
        (role: string, service: JDService, serviceShortId: string) => () => {
            // spin off simulator
            if (!service) {
                const specification =
                    serviceSpecificationFromName(serviceShortId)
                if (specification)
                    addServiceProvider(
                        bus,
                        serviceProviderDefinitionFromServiceClass(
                            specification.classIdentifier
                        )
                    )
            }
            // add twin block
            if (workspace) {
                // try to find existing twin block
                let twinBlock = workspace
                    .getTopBlocks(false)
                    .find(
                        b =>
                            b.type === TWIN_BLOCK &&
                            (
                                b.inputList[0].fieldRow.find(
                                    f => f.name === "role"
                                ) as FieldVariable
                            )?.getVariable()?.name === role
                    ) as BlockSvg
                if (!twinBlock) {
                    twinBlock = workspace.newBlock(TWIN_BLOCK) as BlockSvg
                    const variable = workspace.getVariable(role, serviceShortId)
                    const field = twinBlock.inputList[0].fieldRow.find(
                        f => f.name === "role"
                    ) as FieldVariable
                    field.setValue(variable.getId())
                    twinBlock.initSvg()
                    twinBlock.render(false)
                }
                workspace.centerOnBlock(twinBlock.id)
            }
        }
    return (
        <>
            {roles?.map(({ role, service, serviceShortId }) => (
                <Grid item key={role}>
                    <Tooltip
                        title={service ? `add twin block` : `start simulator`}
                    >
                        <Chip
                            label={role}
                            variant={service ? "default" : "outlined"}
                            avatar={
                                service && (
                                    <DeviceAvatar device={service.device} />
                                )
                            }
                            onClick={handleRoleClick(
                                role,
                                service,
                                serviceShortId
                            )}
                        />
                    </Tooltip>
                </Grid>
            ))}
        </>
    )
}
