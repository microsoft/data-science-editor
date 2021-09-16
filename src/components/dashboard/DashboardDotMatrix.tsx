import React from "react"
import {
    DotMatrixReg,
    DotMatrixVariant,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useChange from "../../jacdac/useChange"
import LEDMatrixWidget from "../widgets/LEDMatrixWidget"
import useRegister from "../hooks/useRegister"

export default function DashboardDotMatrixDisplay(
    props: DashboardServiceProps
) {
    const { service } = props

    const dotsRegister = useRegister(service, DotMatrixReg.Dots)
    const brightnessRegister = useRegister(service, DotMatrixReg.Brightness)
    const rowsRegister = useRegister(service, DotMatrixReg.Rows)
    const columnsRegister = useRegister(service, DotMatrixReg.Columns)
    const variantRegister = useRegister(service, DotMatrixReg.Variant)

    const [dots] = useRegisterUnpackedValue<[Uint8Array]>(dotsRegister, props)
    const [brightness = 0] = useRegisterUnpackedValue<[number]>(
        brightnessRegister,
        props
    )
    const [rows] = useRegisterUnpackedValue<[number]>(rowsRegister, props)
    const [columns] = useRegisterUnpackedValue<[number]>(columnsRegister, props)
    const [variant] = useRegisterUnpackedValue<[DotMatrixVariant]>(
        variantRegister,
        props
    )
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    useChange(server)
    const handleChange = (newLeds: Uint8Array) => {
        dotsRegister.sendSetAsync(newLeds, true)
    }
    return (
        <LEDMatrixWidget
            leds={dots}
            brightness={brightness}
            rows={rows}
            columns={columns}
            color={color}
            onChange={handleChange}
            dots={variant === DotMatrixVariant.Braille}
        />
    )
}
