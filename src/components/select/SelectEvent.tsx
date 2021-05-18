import React from "react"
import MenuItem from "@material-ui/core/MenuItem"
import { JDEvent } from "../../../jacdac-ts/src/jdom/event"
import SelectWithLabel from "../ui/SelectWithLabel"

export default function SelectEvent(props: {
    events: JDEvent[]
    eventId: string
    onChange: (eventId: string) => void
    friendlyName?: boolean
}) {
    const { events, eventId, onChange, friendlyName } = props

    const handleChange = (ev: React.ChangeEvent<{ value: unknown }>) => {
        onChange(ev.target.value as string)
    }

    return (
        <SelectWithLabel
            helperText="choose an event"
            value={eventId}
            onChange={handleChange}
            disabled={!events?.length}
        >
            {events?.map(ev => (
                <MenuItem key={ev.id} value={ev.id}>
                    {friendlyName ? ev.friendlyName : ev.name}
                </MenuItem>
            ))}
        </SelectWithLabel>
    )
}
