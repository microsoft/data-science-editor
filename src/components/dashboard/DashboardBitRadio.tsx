import React, { useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { BitRadioCmd } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { REPORT_RECEIVE } from "../../../jacdac-ts/src/jdom/constants"
import { jdunpack, PackedValues } from "../../../jacdac-ts/src/jdom/pack"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import CodeBlock from "../CodeBlock"

const HORIZON = 10

interface RadioMessageProps {
    time: number
    deviceSerial: number
    rssi: number
    payload: PackedValues
}

export default function DashboardBitRadio(props: DashboardServiceProps) {
    const { service } = props
    const [lastEvents, setLastEvents] = useState<RadioMessageProps[]>([])

    const appendMessage = (data: PackedValues) => {
        if (!data) return

        const [time, deviceSerial, rssi, ...payload] = data
        setLastEvents(lastEvents => {
            const evs = lastEvents.slice(0)
            const msg = { time, deviceSerial, rssi, payload }
            evs.push(msg)
            while (evs.length > HORIZON) evs.shift()
            return lastEvents
        })
    }

    useEffect(
        () =>
            service.subscribe(REPORT_RECEIVE, (pkt: Packet) => {
                let values: PackedValues
                const { data, serviceCommand } = pkt
                switch (serviceCommand) {
                    case BitRadioCmd.NumberReceived:
                        values = jdunpack(data, "u32 u32 i8 x[3] f64 s")
                        break
                    case BitRadioCmd.StringReceived:
                        values = jdunpack(data, "u32 u32 i8 x[1] s")
                        break
                    case BitRadioCmd.BufferReceived:
                        values = jdunpack(data, "u32 u32 i8 x[1] b")
                        break
                }
                if (values)
                    appendMessage(
                        values.filter(v => v !== undefined && v !== "")
                    )
            }),
        [service, lastEvents]
    )

    const text = lastEvents
        .map(ev =>
            ev.payload?.filter(v => v !== undefined && v !== "").join(",")
        )
        .filter(el => !!el)
        .join("\n")
    return <CodeBlock>{text}</CodeBlock>
}
