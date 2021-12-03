import React, { useContext } from "react"
import BlockContext from "./BlockContext"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import DeviceAvatar from "../devices/DeviceAvatar"

import { BlockSvg, FieldVariable } from "blockly"
import { Chip } from "@mui/material"
import { SENSOR_BLOCK } from "./toolbox"
import { toServiceName, toServiceType } from "./dsl/servicesbase"
import JDService from "../../../jacdac-ts/src/jdom/service"

export default function ServiceChip(props: { service: JDService }) {
    const { workspace } = useContext(BlockContext)
    const { service } = props
    const name = toServiceName(service)
    const handleClick = () => {
        // add twin block
        if (!workspace) return

        const id = service.id

        // try to find existing twin block
        let twinBlock = workspace
            .getTopBlocks(false)
            .find(
                b =>
                    b.type === SENSOR_BLOCK &&
                    (
                        b.inputList[0].fieldRow.find(
                            f => f.name === "service"
                        ) as FieldVariable
                    )
                        ?.getVariable()
                        ?.getId() === id
            ) as BlockSvg
        if (!twinBlock) {
            twinBlock = workspace.newBlock(SENSOR_BLOCK) as BlockSvg
            const type = toServiceType(service)

            let variable = workspace.getVariable(name, type)
            if (!variable) variable = workspace.getVariable(name, type)
            console.debug(`new twin`, { twinBlock, variable })
            const field = twinBlock.inputList[0].fieldRow.find(
                f => f.name === "service"
            ) as FieldVariable
            field.setValue(variable.getId())
            const m = workspace.getMetrics()
            twinBlock.moveBy(m.viewWidth / 2, m.viewHeight / 3)
            twinBlock.initSvg()
            twinBlock.render(false)
        }
        workspace.centerOnBlock(twinBlock.id)
    }

    return (
        <Chip
            label={name}
            variant={"outlined"}
            avatar={<DeviceAvatar device={service.device} size="small" />}
            onClick={handleClick}
        />
    )
}
