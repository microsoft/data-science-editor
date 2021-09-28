import React, { useContext, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import LEDServer from "../../../jacdac-ts/src/servers/ledserver"
import { LedCmd, LedReg } from "../../../jacdac-ts/src/jdom/constants"
import LoadingProgress from "../ui/LoadingProgress"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import AppContext from "../AppContext"
import LEDWidget from "../widgets/LEDWidget"
import useRegister from "../hooks/useRegister"
import useEffectAsync from "../useEffectAsync"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"

export default function DashboardLED(props: DashboardServiceProps) {
    const { service } = props
    const { setError } = useContext(AppContext)
    const server = useServiceServer<LEDServer>(service)
    const color = server ? "secondary" : "primary"
    const [rgb, setRgb] = useState(0)
    const [speed, setSpeed] = useState(32)
    const [brightness, setBrightness] = useState(16)

    const waveLengthRegister = useRegister(service, LedReg.WaveLength)
    const [waveLength] = useRegisterUnpackedValue<[number]>(
        waveLengthRegister,
        props
    )
    const ledCountRegister = useRegister(service, LedReg.LedCount)
    const [ledCount] = useRegisterUnpackedValue<[number]>(
        ledCountRegister,
        props
    )

    const r = ((((rgb >> 16) & 0xff) << 8) / brightness) & 0xff
    const g = ((((rgb >> 8) & 0xff) << 8) / brightness) & 0xff
    const b = ((((rgb >> 0) & 0xff) << 8) / brightness) & 0xff

    // send animate command
    const animate = async () => {
        try {
            await service.sendCmdAsync(
                LedCmd.Animate,
                jdpack<[number, number, number, number]>("u8 u8 u8 u8", [
                    r,
                    g,
                    b,
                    speed,
                ])
            )
        } catch (e) {
            setError(e)
        }
    }

    // handle brightness, speed changes
    useEffectAsync(animate, [rgb, speed, brightness])

    // nothing to see
    if (isNaN(rgb)) return <LoadingProgress />

    return (
        <LEDWidget
            color={color}
            ledColor={rgb}
            waveLength={waveLength}
            ledCount={ledCount}
            onLedColorChange={setRgb}
            speed={speed}
            onSpeedChange={setSpeed}
            brightness={brightness}
            onBrightnessChange={setBrightness}
        />
    )
}
