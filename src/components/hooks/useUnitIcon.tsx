import React from "react"
import HumidityIcon from "../icons/HumidityIcon"
import TemperatureIcon from "../icons/TemperatureIcon"
import { resolveUnit } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import { SvgIconProps } from "@mui/material"

export default (unit: string, props?: SvgIconProps) => {
    const { unit: runit } = resolveUnit(unit) || {}
    switch (runit) {
        case "%RH":
            return <HumidityIcon {...props} />
        case "°C":
        case "K":
            return <TemperatureIcon {...props} />
        default:
            return null
    }
}
