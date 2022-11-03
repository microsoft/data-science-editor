import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import { LightBulbReg } from "../../../jacdac-ts/src/jdom/constants"
import useRegister from "../hooks/useRegister"
import { Grid, Slider } from "@mui/material"
import SvgWidget from "../widgets/SvgWidget"
import PowerButton from "../widgets/PowerButton"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardLightBulb(props: DashboardServiceProps) {
    const { service } = props
    const server = useServiceServer<SensorServer<[boolean]>>(service)
    const color = server ? "secondary" : "primary"
    const { controlBackground, active, textProps } = useWidgetTheme(color)
    const brightnessRegister = useRegister(service, LightBulbReg.Brightness)
    const [brightness] = useRegisterUnpackedValue<[number]>(
        brightnessRegister,
        props
    )
    const brightnessPercent = Math.round(brightness * 100)
    const dimmeableRegister = useRegister(service, LightBulbReg.Dimmable)
    const dimmeable = useRegisterBoolValue(dimmeableRegister, props)

    if (brightness === undefined)
        return <DashboardRegisterValueFallback register={brightnessRegister} />

    const handleChecked = () =>
        brightnessRegister.sendSetPackedAsync([brightness > 0 ? 0 : 1], true)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange: any = (event: unknown, value: number | number[]) => {
        const b = (value as number) / 100
        brightnessRegister.sendSetPackedAsync([b], true)
    }

    const w = 96
    const sw = 2
    const cx = w / 2
    const cy = w / 2
    const r = w / 2 - 4
    const ri = (r * brightnessPercent) / 100
    const roff = r / 3
    const riff = roff - 4
    const on = brightnessPercent > 0
    const off = !on
    const tvalue = dimmeable
        ? `${Math.round(brightnessPercent)}%`
        : on
        ? "on"
        : "off"
    const widgetSize = `clamp(4rem, 12vw, 12vh)`

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SvgWidget tabIndex={0} width={w} height={w} size={widgetSize}>
                    <circle
                        cx={cx}
                        cy={cx}
                        r={r}
                        fill={controlBackground}
                        strokeWidth={sw}
                    />
                    <circle
                        cx={cy}
                        cy={cy}
                        r={ri}
                        fill={active}
                        stroke={controlBackground}
                        strokeWidth={sw}
                    />
                    {dimmeable !== true ? (
                        <PowerButton
                            off={off}
                            label={tvalue}
                            cx={cx}
                            cy={cy}
                            r={roff}
                            ri={riff}
                            color={color}
                            onClick={handleChecked}
                        />
                    ) : (
                        <text {...textProps} x={cx} y={cy} aria-label={tvalue}>
                            {tvalue}
                        </text>
                    )}
                </SvgWidget>
            </Grid>
            {dimmeable === true && (
                <Grid item xs={12}>
                    <Slider
                        value={brightnessPercent}
                        min={0}
                        max={100}
                        valueLabelDisplay="off"
                        onChange={handleChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
