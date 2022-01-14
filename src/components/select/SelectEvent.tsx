import React from "react"
import MenuItem from "@mui/material/MenuItem"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import SelectWithLabel from "../ui/SelectWithLabel"
import { SelectChangeEvent } from "@mui/material"

export default function SelectEvent(props: {
    events: JDEvent[]
    eventId: string
    onChange: (eventId: string) => void
    friendlyName?: boolean
    label?: string
}) {
    const { events, eventId, onChange, friendlyName, label } = props

    const handleChange = (ev: SelectChangeEvent<string>) => {
        onChange(ev.target.value)
    }

    return (
        <SelectWithLabel
            helperText={label || "choose an event"}
            value={eventId}
            onChange={handleChange}
            disabled={!events?.length}
            none={"None"}
        >
            {events?.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>
                    {friendlyName ? ev.friendlyName : ev.name}
                </MenuItem>
            ))}
        </SelectWithLabel>
    )
}
