import React, { useEffect } from "react"
import {
    BuzzerCmd,
    REPORT_UPDATE,
    SRV_ACCELEROMETER,
    SRV_BUZZER,
} from "../../../jacdac-ts/src/jdom/constants"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import Packet from "../../../jacdac-ts/src/jdom/packet"
import { throttle } from "../../../jacdac-ts/src/jdom/utils"
import Dashboard from "../../components/dashboard/Dashboard"
import useServiceProviderFromServiceClass from "../../components/hooks/useServiceProviderFromServiceClass"
import useServices from "../../components/hooks/useServices"

function tonePayload(frequency: number, ms: number, volume: number) {
    const period = Math.round(1000000 / frequency)
    const duty = (period * volume) >> 11
    return jdpack("u16 u16 u16", [period, duty, ms])
}

const TONE_DURATION = 100
const TONE_THROTTLE = 100

export default function AccelerometerTheremin() {
    // collect accelerometers and buzzers on the bus
    const accelerometers = useServices({ serviceClass: SRV_ACCELEROMETER })
    const buzzers = useServices({ serviceClass: SRV_BUZZER })

    // spin up a buzzer simulator
    useServiceProviderFromServiceClass(SRV_ACCELEROMETER)
    useServiceProviderFromServiceClass(SRV_BUZZER)

    console.log({ accelerometers, buzzers })

    // register for accelerometer data events
    useEffect(() => {
        const unsubs = accelerometers.map(accelerometer =>
            accelerometer.readingRegister.subscribe(
                REPORT_UPDATE,
                // don't trigger more than every 100ms
                throttle(async () => {
                    const [x] = accelerometer.readingRegister.unpackedValue
                    await Promise.all(
                        buzzers.map(async buzzer => {
                            const pkt = Packet.from(
                                BuzzerCmd.PlayTone,
                                tonePayload(
                                    1000 + Math.abs(x) * 1000,
                                    TONE_DURATION,
                                    1
                                )
                            )
                            await buzzer.sendPacketAsync(pkt)
                        })
                    )
                }, TONE_THROTTLE)
            )
        )
        // cleanup callback
        return () => unsubs.forEach(u => u())
    }, [accelerometers, buzzers]) // re-register if accelerometers, buzzers change

    // TODO any specific rendering needed here?
    return <Dashboard />
}
