import React, { useMemo, useState } from "react"
import { Menu, MenuItem, Typography } from "@mui/material"
import {
    isInfrastructure,
    serviceSpecificationFromClassIdentifier,
    serviceSpecifications,
} from "../../jacdac-ts/src/jdom/spec"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import AddIcon from "@mui/icons-material/Add"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import IconButtonWithTooltip from "./ui/IconButtonWithTooltip"
import { useId } from "react-use-id-hook"

export default function AddServiceIconButton(props: {
    onAdd: (service: jdspec.ServiceSpec) => void
    serviceFilter?: (service: jdspec.ServiceSpec) => boolean
    error?: string
    children?: JSX.Element | JSX.Element[]
}) {
    const { error, onAdd, children, serviceFilter } = props
    const [servicesAnchorEl, setServicesAnchorEl] =
        useState<null | HTMLElement>(null)
    const servicesMenuId = useId()
    const services = useMemo(
        () =>
            serviceSpecifications()
                .filter(srv => !isInfrastructure(srv))
                .filter(srv => !serviceFilter || serviceFilter(srv)),
        [serviceFilter]
    )

    const handleServiceAddClick = (
        event: React.MouseEvent<HTMLButtonElement>
    ) => {
        setServicesAnchorEl(event.currentTarget)
    }
    const handleServiceAddClose = (id: number) => () => {
        setServicesAnchorEl(null)
        if (id !== undefined) {
            const srv = serviceSpecificationFromClassIdentifier(id)
            onAdd(srv)
        }
    }

    return (
        <>
            <IconButtonWithTooltip
                title="Add a service"
                aria-controls={servicesMenuId}
                aria-haspopup="true"
                onClick={handleServiceAddClick}
            >
                {children || <AddIcon />}
            </IconButtonWithTooltip>
            <Menu
                id={servicesMenuId}
                anchorEl={servicesAnchorEl}
                keepMounted
                open={Boolean(servicesAnchorEl)}
                onClose={handleServiceAddClose(undefined)}
            >
                {services.map(srv => (
                    <MenuItem
                        key={srv.classIdentifier}
                        value={srv.classIdentifier.toString(16)}
                        onClick={handleServiceAddClose(srv.classIdentifier)}
                    >
                        {srv.name}
                    </MenuItem>
                ))}
            </Menu>
            <Typography
                variant="caption"
                color={error ? "error" : "inherit"}
                component="div"
            >
                {error || "Select one or more services."}
            </Typography>
        </>
    )
}
