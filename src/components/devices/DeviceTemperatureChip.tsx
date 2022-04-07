import {
    ControlReg,
    JD_SERVICE_INDEX_CTRL,
} from "../../../jacdac-ts/src/jdom/constants"
import { Chip } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useService from "../../jacdac/useService"

export default function DeviceTemperatureChip(props: { device: JDDevice }) {
    const { device } = props
    const controlService = useService(device, JD_SERVICE_INDEX_CTRL)
    const tempRegister = useRegister(controlService, ControlReg.McuTemperature)
    const [temperature] = useRegisterUnpackedValue<[number]>(tempRegister)
    if (isNaN(temperature)) return null
    return <Chip size="small" label={`${temperature}°`} />
}
