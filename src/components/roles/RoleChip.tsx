import React from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import DeviceAvatar from "../devices/DeviceAvatar"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useServiceServer from "../hooks/useServiceServer"
import CancelIcon from "@mui/icons-material/Cancel"
import { Chip, Tooltip } from "@mui/material"
import useBus from "../../jacdac/useBus"

export default function RoleChip(props: {
    role: string
    serviceClass: number
    service: JDService
    onClick: () => void
}) {
    const bus = useBus()
    const { role, service, onClick } = props
    const serviceServer = useServiceServer(service)

    const roleName = role.split("?", 1)[0]

    const handleDelete = () => bus.removeServiceProvider(serviceServer.device)
    return (
        <Chip
            label={roleName}
            variant={service ? undefined : "outlined"}
            avatar={service && <DeviceAvatar device={service.device} />}
            onClick={onClick}
            onDelete={serviceServer ? handleDelete : undefined}
            deleteIcon={
                <Tooltip title="stop simulator">
                    <CancelIcon />
                </Tooltip>
            }
        />
    )
}
