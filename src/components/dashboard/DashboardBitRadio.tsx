import React, { useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { BitRadioEvent } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import { jdunpack, PackedValues } from "../../../jacdac-ts/src/jdom/pack"

export default function DashboardBitRadio(props: DashboardServiceProps) {
    const { service } = props
    const numberReceivedEvent = service.event(BitRadioEvent.NumberReceived)
    const stringReceivedEvent = service.event(BitRadioEvent.StringReceived)
    const bufferReceivedEvent = service.event(BitRadioEvent.BufferReceived)
    const [lastEvents, setLastEvents] = useState<
        {
            time: number
            deviceSerial: number
            rssi: number
            payload: PackedValues
        }[]
    >([])

    const appendMessage = (data: PackedValues) => {
        const [time, deviceSerial, rssi, ...payload] = data
        const evs = lastEvents.slice(0)
        const msg = { time, deviceSerial, rssi, payload }
        evs.push(msg)
        while (evs.length > 10) evs.shift()
        setLastEvents(evs)
    }

    useEffect(
        () =>
            numberReceivedEvent.subscribe(EVENT, () =>
                appendMessage(
                    jdunpack(numberReceivedEvent.data, "u32 u32 i8 x[3] f64 s")
                )
            ),
        [numberReceivedEvent, lastEvents]
    )
    useEffect(
        () =>
            stringReceivedEvent.subscribe(EVENT, () =>
                appendMessage(
                    jdunpack(stringReceivedEvent.data, "u32 u32 i8 x[1] s")
                )
            ),
        [stringReceivedEvent, lastEvents]
    )
    useEffect(
        () =>
        bufferReceivedEvent.subscribe(EVENT, () =>
                appendMessage(
                    jdunpack(bufferReceivedEvent.data, "u32 u32 i8 x[1] b")
                )
            ),
        [bufferReceivedEvent, lastEvents]
    )

    return (
        <>
            {lastEvents.map((lv, i) => (
                <div key={i}>
                    {lv.payload
                        .filter(v => v !== undefined && v !== "")
                        .join(", ")}
                </div>
            ))}
        </>
    )
}
