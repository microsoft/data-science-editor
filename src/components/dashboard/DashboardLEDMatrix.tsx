import React from "react"
import { LedMatrixReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useChange from "../../jacdac/useChange"
import LEDMatrixDisplayWidget from "../ui/LEDMatrixWidgets"

export default function DashboardLEDMatrixDisplay(
    props: DashboardServiceProps
) {
    const { service } = props

    const ledsRegister = service.register(LedMatrixReg.Leds)
    const [leds] = useRegisterUnpackedValue<[Uint8Array]>(ledsRegister, props)
    const [brightness = 0] = useRegisterUnpackedValue<[number]>(
        service.register(LedMatrixReg.Brightness),
        props
    )
    const [rows] = useRegisterUnpackedValue<[number]>(
        service.register(LedMatrixReg.Rows),
        props
    )
    const [columns] = useRegisterUnpackedValue<[number]>(
        service.register(LedMatrixReg.Columns),
        props
    )
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    useChange(server)
    const handleChange = (newLeds: Uint8Array) => {
        ledsRegister.sendSetAsync(newLeds, true)
    }
    return (
        <LEDMatrixDisplayWidget
            leds={leds}
            brightness={brightness}
            rows={rows}
            columns={columns}
            color={color}
            onChange={handleChange}
        />
    )
}
