import React, { useEffect, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import {
    COMMAND_RECEIVE,
    LedSingleCmd,
    LedSingleReg,
} from "../../../jacdac-ts/src/jdom/constants"
import LoadingProgress from "../ui/LoadingProgress"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import LEDWidget from "../widgets/LEDWidget"
import useRegister from "../hooks/useRegister"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
import useSnackbar from "../hooks/useSnackbar"

export default function DashboardLEDSingle(props: DashboardServiceProps) {
    const { service } = props
    const { setError } = useSnackbar()
    const server = useServiceServer(service)
    const themeColor = server ? "secondary" : "primary"

    const [speed, setSpeed] = useState(64)
    const [brightness, setBrightness] = useState(32)

    const colorRegister = useRegister(service, LedSingleReg.Color)
    const [r, g, b] = useRegisterUnpackedValue<[number, number, number]>(
        colorRegister,
        props
    )
    const [uiColor, setUiColor] = useState((r << 16) | (g << 8) | b)
    const [uiSpeed, setUiSpeed] = useState(speed)

    const waveLengthRegister = useRegister(service, LedSingleReg.WaveLength)
    const [waveLength] = useRegisterUnpackedValue<[number]>(
        waveLengthRegister,
        props
    )
    const ledCountRegister = useRegister(service, LedSingleReg.LedCount)
    const [ledCount] = useRegisterUnpackedValue<[number]>(
        ledCountRegister,
        props
    )

    const setRgb = async (rgb: number) => {
        const r = ((((rgb >> 16) & 0xff) * brightness) >> 8) & 0xff
        const g = ((((rgb >> 8) & 0xff) * brightness) >> 8) & 0xff
        const b = ((((rgb >> 0) & 0xff) * brightness) >> 8) & 0xff
        try {
            await service.sendCmdAsync(
                LedSingleCmd.Animate,
                jdpack<[number, number, number, number]>("u8 u8 u8 u8", [
                    r,
                    g,
                    b,
                    speed,
                ])
            )
            setUiColor((r << 16) | (g << 8) | b)
            setUiSpeed(speed)
        } catch (e) {
            setError(e)
        }
    }

    // sniff animate call
    useEffect(
        () =>
            service?.subscribe(COMMAND_RECEIVE, (pkt: Packet) => {
                if (pkt.serviceCommand === LedSingleCmd.Animate) {
                    const [r, g, b, s] =
                        pkt.jdunpack<[number, number, number, number]>(
                            "u8 u8 u8 u8"
                        )
                    setUiColor((r << 16) | (g << 8) | b)
                    setUiSpeed(s)
                }
            }),
        [service]
    )

    // sync color
    useEffect(() => setUiColor((r << 16) | (g << 8) | b), [r, g, b])
    // nothing to see
    if (isNaN(uiColor)) return <LoadingProgress />

    return (
        <LEDWidget
            color={themeColor}
            ledColor={uiColor}
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
