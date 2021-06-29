import React, { useContext, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import LEDServer from "../../../jacdac-ts/src/servers/ledserver"
import { LedCmd, LedReg } from "../../../jacdac-ts/src/jdom/constants"
import LoadingProgress from "../ui/LoadingProgress"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import AppContext from "../AppContext"
import useChange from "../../jacdac/useChange"
import LEDWidget from "../widgets/LEDWidget"
import useRegister from "../hooks/useRegister"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function DashboardLED(props: DashboardServiceProps) {
    const { service } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setError } = useContext(AppContext)
    const server = useServiceServer<LEDServer>(service)
    const color = server ? "secondary" : "primary"
    const [speed, setSpeed] = useState(32)

    const waveLengthRegister = useRegister(service, LedReg.WaveLength)
    const [waveLength] = useRegisterUnpackedValue<[number]>(
        waveLengthRegister,
        props
    )
    const busColorRegister = useRegister(service, LedReg.Color)
    const busColor = useRegisterUnpackedValue<[number, number, number]>(
        busColorRegister,
        props
    )
    const serverColor = useChange(server?.color, _ => _?.values())

    const ledCountRegister = useRegister(service, LedReg.LedCount)
    const [ledCount] = useRegisterUnpackedValue<[number]>(
        ledCountRegister,
        props
    )

    const [r, g, b] = serverColor || busColor
    const rgb = (r << 16) | (g << 8) | b

    // nothing to see
    if (r === undefined) return <LoadingProgress />

    // send animate command
    const handleSetColor = async (col: number) => {
        try {
            await service.sendCmdAsync(
                LedCmd.Animate,
                jdpack<[number, number, number, number]>("u8 u8 u8 u8", [
                    (col >> 16) & 0xff,
                    (col >> 8) & 0xff,
                    col & 0xff,
                    speed,
                ])
            )
            await bus.delay(500)
            await busColorRegister.sendGetAsync()
        } catch (e) {
            setError(e)
        }
    }

    return (
        <LEDWidget
            color={color}
            ledColor={rgb}
            waveLength={waveLength}
            ledCount={ledCount}
            onLedColorChange={handleSetColor}
            speed={speed}
            onSpeedChange={setSpeed}
        />
    )
}
