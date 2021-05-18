import React, { useContext, useState } from "react"
import EventSelect from "../../components/EventSelect"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function HIDEvents() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [eventId, setEventId] = useState("")

    const handleEventChange = (id: string) => setEventId(id)

    return (
        <>
            <h1>HID Event</h1>
            <div>
                <EventSelect
                    eventId={eventId}
                    onChange={handleEventChange}
                    label="Choose an event"
                />
            </div>
        </>
    )
}
