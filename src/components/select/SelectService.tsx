import { MenuItem } from "@mui/material"
import React, { ChangeEvent } from "react"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import SelectWithLabel from "../ui/SelectWithLabel"

export default function SelectService(props: {
    services: JDService[]
    serviceId: string
    onChange: (newServiceId: string) => void
    friendlyName?: boolean
    helperText?: string
}) {
    const { services, serviceId, onChange, helperText, friendlyName } = props

    const handleChange = async (
        ev: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const id = ev.target.value as string
        onChange(id)
    }
    return (
        <SelectWithLabel
            helperText={helperText || "choose a service"}
            value={serviceId}
            onChange={handleChange}
            disabled={!services?.length}
        >
            {services?.map(srv => (
                <MenuItem key={srv.id} value={srv.id}>
                    {friendlyName
                        ? srv.friendlyName
                        : srv.instanceName || srv.name}
                </MenuItem>
            ))}
        </SelectWithLabel>
    )
}
