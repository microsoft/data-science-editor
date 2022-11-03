import React, { CSSProperties } from "react"
import { RelayReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useServiceServer from "../hooks/useServiceServer"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import useWidgetTheme from "../widgets/useWidgetTheme"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"
import { DashboardServiceProps } from "./DashboardServiceWidget"

export default function DashboardRelay(props: DashboardServiceProps) {
    const { service } = props
    const activeRegister = useRegister(service, RelayReg.Active)
    const active = useRegisterBoolValue(activeRegister, props)
    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    const { textPrimary } = useWidgetTheme(color)

    const handleClose = (event: unknown, checked) =>
        activeRegister?.sendSetBoolAsync(checked, true)

    if (active === undefined)
        return <DashboardRegisterValueFallback register={activeRegister} />

    const labelStyle: CSSProperties = {
        color: textPrimary,
    }
    return (
        <SwitchWithLabel
            label={active ? "active" : "inactive"}
            checked={active}
            onChange={handleClose}
            labelStyle={labelStyle}
        />
    )
}
