import React, { useContext } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import LEDServer from "../../../jacdac-ts/src/servers/ledserver"
import { LedCmd, LedReg } from "../../../jacdac-ts/src/jdom/constants"
import LoadingProgress from "../ui/LoadingProgress"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import AppContext from "../AppContext"
import useChange from "../../jacdac/useChange"
import { delay } from "../../../jacdac-ts/src/jdom/utils"
import LEDWidget from "../widgets/LEDWidget"
import useRegister from "../hooks/useRegister"

export default function DashboardLED(props: DashboardServiceProps) {
    const { service } = props
    const { setError } = useContext(AppContext)
    const server = useServiceServer<LEDServer>(service)
    const color = server ? "secondary" : "primary"
    const waveLengthRegister = useRegister(service, LedReg.WaveLength)
    const [waveLength] = useRegisterUnpackedValue<[number]>(
        waveLengthRegister,
        props
    )
    const colorRegister = useRegister(service, LedReg.Color)
    const busColor = useRegisterUnpackedValue<[number, number, number]>(
        colorRegister,
        props
    )
    const serverColor = useChange(server?.color, _ => _?.values())
    const [r, g, b] = serverColor || busColor
    const rgb = (r << 16) | (g << 8) | b

    const ledCountRegister = useRegister(service, LedReg.LedCount)
    const [ledCount] = useRegisterUnpackedValue<[number]>(
        ledCountRegister,
        props
    )

    // nothing to see
    if (r === undefined) return <LoadingProgress />

    // send animate command
    const handleSetColor = (col: number) => async () => {
        try {
            await service.sendCmdAsync(
                LedCmd.Animate,
                jdpack<[number, number, number, number]>("u8 u8 u8 u8", [
                    (col >> 16) & 0xff,
                    (col >> 8) & 0xff,
                    col & 0xff,
                    32,
                ])
            )
            await delay(500)
            await colorRegister.sendGetAsync()
        } catch (e) {
            setError(e)
        }
    }

    return (
        <LEDWidget
            color={color}
            value={rgb}
            waveLength={waveLength}
            ledCount={ledCount}
            onChange={handleSetColor}
        />
    )
}
