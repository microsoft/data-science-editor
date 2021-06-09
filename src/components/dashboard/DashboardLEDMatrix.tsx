import React from "react"
import { LedMatrixReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useChange from "../../jacdac/useChange"
import LEDMatrixWidget from "../widgets/LEDMatrixWidget"
import useRegister from "../hooks/useRegister"

export default function DashboardLEDMatrixDisplay(
    props: DashboardServiceProps
) {
    const { service } = props

    const ledsRegister = useRegister(service, LedMatrixReg.Leds)
    const brightnessRegister = useRegister(service, LedMatrixReg.Brightness)
    const rowsRegister = useRegister(service, LedMatrixReg.Rows)
    const columnsRegister = useRegister(service, LedMatrixReg.Columns)

    const [leds] = useRegisterUnpackedValue<[Uint8Array]>(ledsRegister, props)
    const [brightness = 0] = useRegisterUnpackedValue<[number]>(
        brightnessRegister,
        props
    )
    const [rows] = useRegisterUnpackedValue<[number]>(rowsRegister, props)
    const [columns] = useRegisterUnpackedValue<[number]>(columnsRegister, props)
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    useChange(server)
    const handleChange = (newLeds: Uint8Array) => {
        ledsRegister.sendSetAsync(newLeds, true)
    }
    return (
        <LEDMatrixWidget
            leds={leds}
            brightness={brightness}
            rows={rows}
            columns={columns}
            color={color}
            onChange={handleChange}
        />
    )
}
