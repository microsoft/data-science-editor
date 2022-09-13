import React from "react"
import {
    PowerPowerStatus,
    PowerReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { ReflectedLightServer } from "../../../jacdac-ts/src/servers/reflectedlightserver"
import useRegister from "../hooks/useRegister"
import { humanify } from "../../../jacdac-ts/jacdac-spec/spectool/jdspec"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"
import { Grid } from "@mui/material"
import RegisterInput from "../RegisterInput"
import SliderWithLabel from "../ui/SliderWithLabel"
import SwitchWithLabel from "../ui/SwitchWithLabel"

export default function DashboardPower(props: DashboardServiceProps) {
    const { service, expanded, visible } = props

    const allowedRegister = useRegister(service, PowerReg.Allowed)
    const powerStatusRegister = useRegister(service, PowerReg.PowerStatus)
    const batteryChargeRegister = useRegister(service, PowerReg.BatteryCharge)
    const keepOnPulseDurationRegister = useRegister(
        service,
        PowerReg.KeepOnPulseDuration
    )
    const keepOnPulsePeriodRegister = useRegister(
        service,
        PowerReg.KeepOnPulsePeriod
    )

    const allowed = useRegisterBoolValue(allowedRegister, props)
    const [powerStatus] = useRegisterUnpackedValue<[PowerPowerStatus]>(
        powerStatusRegister,
        props
    )
    const [batteryCharge] = useRegisterUnpackedValue<[number]>(
        batteryChargeRegister,
        props
    )

    const server = useServiceServer<ReflectedLightServer>(service)
    const color = server ? "secondary" : "primary"

    if (powerStatus === undefined)
        return <DashboardRegisterValueFallback register={powerStatusRegister} />

    const off = !allowed
    const label = off
        ? "off"
        : humanify(PowerPowerStatus[powerStatus]?.toLowerCase())

    const toggleEnabled = () => allowedRegister.sendSetBoolAsync(!allowed, true)

    return (
        <Grid container spacing={1} alignItems="center">
            <Grid item xs={12}>
                <SwitchWithLabel
                    color={
                        powerStatus === PowerPowerStatus.Overload ||
                        powerStatus === PowerPowerStatus.Overprovision
                            ? "error"
                            : color
                    }
                    label={label}
                    checked={!off}
                    onChange={toggleEnabled}
                />
            </Grid>
            {batteryCharge !== undefined && (
                <Grid item>
                    <SliderWithLabel
                        label="battery"
                        value={Math.floor(batteryCharge * 100)}
                        min={0}
                        max={100}
                    />
                </Grid>
            )}
            {expanded && (
                <Grid item xs={12}>
                    <RegisterInput
                        register={keepOnPulseDurationRegister}
                        showRegisterName={true}
                        visible={visible}
                    />
                </Grid>
            )}
            {expanded && (
                <Grid item xs={12}>
                    <RegisterInput
                        register={keepOnPulsePeriodRegister}
                        showRegisterName={true}
                        visible={visible}
                    />
                </Grid>
            )}
        </Grid>
    )
}
