import React, { useContext } from "react"
import BlockContext from "./BlockContext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DeviceAvatar from "../devices/DeviceAvatar"
import { serviceSpecificationFromClassIdentifier } from "../../../jacdac-ts/src/jdom/spec"
import JDService from "../../../jacdac-ts/src/jdom/service"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"

import { BlockSvg, FieldVariable } from "blockly"
import useServiceServer from "../hooks/useServiceServer"
import CancelIcon from "@mui/icons-material/Cancel"
import { Chip, Tooltip } from "@mui/material"
import { TWIN_BLOCK } from "./toolbox"
import { toRoleType } from "./dsl/servicesbase"

export default function RoleChip(props: {
    role: string
    serviceClass: number
    service: JDService
    preferredDeviceId: string
}) {
    const { workspace } = useContext(BlockContext)
    const { role, service, serviceClass, preferredDeviceId } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const serviceServer = useServiceServer(service)
    const handleRoleClick = () => {
        // spin off simulator
        if (!service && !preferredDeviceId) {
            const specification =
                serviceSpecificationFromClassIdentifier(serviceClass)
            if (specification) {
                addServiceProvider(
                    bus,
                    serviceProviderDefinitionFromServiceClass(
                        specification.classIdentifier
                    )
                )
            }
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
                let variable = workspace.getVariable(
                    role,
                    toRoleType(service.specification, true)
                )
                if (!variable)
                    variable = workspace.getVariable(
                        role,
                        toRoleType(service.specification, false)
                    )
                console.debug(`new twin`, { twinBlock, variable })
                const field = twinBlock.inputList[0].fieldRow.find(
                    f => f.name === "role"
                ) as FieldVariable
                field.setValue(variable.getId())
                const m = workspace.getMetrics()
                twinBlock.moveBy(m.viewWidth / 2, m.viewHeight / 3)
                twinBlock.initSvg()
                twinBlock.render(false)
            }
            workspace.centerOnBlock(twinBlock.id)
        }
    }

    const handleDelete = () => bus.removeServiceProvider(serviceServer.device)
    return (
        <Chip
            label={role}
            variant={service ? undefined : "outlined"}
            avatar={service && <DeviceAvatar device={service.device} />}
            onClick={handleRoleClick}
            onDelete={serviceServer ? handleDelete : undefined}
            deleteIcon={
                <Tooltip title="stop simulator">
                    <CancelIcon />
                </Tooltip>
            }
        />
    )
}
