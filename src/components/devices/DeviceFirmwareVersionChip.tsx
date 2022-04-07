import {
    ControlReg,
    JD_SERVICE_INDEX_CTRL,
} from "../../../jacdac-ts/src/jdom/constants"
import { Chip } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import useRegister from "../hooks/useRegister"
import useService from "../../jacdac/useService"

export default function DeviceFirmwareVersionChip(props: { device: JDDevice }) {
    const { device } = props
    const specification = useDeviceSpecification(device)
    const control = useService(device, JD_SERVICE_INDEX_CTRL)
    const productIdentifierRegister = useRegister(
        control,
        ControlReg.ProductIdentifier
    )
    const [productIdentifier] = useRegisterUnpackedValue<[number]>(
        productIdentifierRegister
    )
    const firmwareVersionRegister = useRegister(
        control,
        ControlReg.FirmwareVersion
    )
    const [firmwareVersion] = useRegisterUnpackedValue<[string]>(
        firmwareVersionRegister
    )
    if (firmwareVersion == undefined) return null

    const firmwareName =
        !!productIdentifier &&
        specification?.firmwares?.find(
            fw => fw.productIdentifier === productIdentifier
        )?.name

    return (
        <Chip
            size="small"
            label={[firmwareName, firmwareVersion].filter(f => !!f).join(" ")}
        />
    )
}
