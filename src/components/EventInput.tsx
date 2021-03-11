import React from "react"
import { JDEvent } from "../../jacdac-ts/src/jdom/event"
import { Typography, Badge } from "@material-ui/core"
import KindIcon from "./KindIcon"
import useEventCount from "../jacdac/useEventCount"
import DeviceName from "./devices/DeviceName"

export default function EventInput(props: {
    event: JDEvent
    showDeviceName?: boolean
    showName?: boolean
}) {
    const { event, showName, showDeviceName } = props
    const count = useEventCount(event)
    const spec = event.specification

    return (
        <>
            {showDeviceName && (
                <Typography>
                    <DeviceName device={event.service.device} />/
                </Typography>
            )}
            {showName && spec && (
                <Typography gutterBottom>{spec.name}</Typography>
            )}
            <Badge badgeContent={count} color="primary">
                <KindIcon kind={"event"} />
            </Badge>
        </>
    )
}
