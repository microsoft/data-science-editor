import React from "react"
import { JDService } from "../../jacdac-ts/src/jdom/service"
import { isEvent } from "../../jacdac-ts/src/jdom/spec"
import EventInput from "./EventInput"
import AutoGrid from "./ui/AutoGrid"

export default function ServiceEvents(props: {
    service: JDService
    eventIdentifiers?: number[]
    showEventName?: boolean
}) {
    const { service, eventIdentifiers, showEventName } = props
    const spec = service.specification
    const packets = spec.packets
    let events = packets.filter(isEvent)
    if (eventIdentifiers !== undefined)
        events = events.filter(
            event => eventIdentifiers.indexOf(event.identifier) > -1
        )

    return (
        <AutoGrid spacing={1}>
            {events.map(event => (
                <EventInput
                    key={`event${event.identifier}`}
                    event={service.event(event.identifier)}
                    showName={showEventName}
                />
            ))}
        </AutoGrid>
    )
}
