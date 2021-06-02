import React from "react"
import { WaterLevelReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import useWidgetSize from "../widgets/useWidgetSize"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import { Grid, Slider } from "@material-ui/core"
import SensorServer from "../../../jacdac-ts/src/servers/sensorserver"
import useRegister from "../hooks/useRegister"

export default function DashbaordWaterLevel(props: DashboardServiceProps) {
    const { service, services, variant } = props

    const levelRegister = useRegister(service, WaterLevelReg.Level)
    const [value] = useRegisterUnpackedValue<[number]>(levelRegister, props)
    const server = useServiceServer<SensorServer<[number]>>(service)
    const color = server ? "secondary" : "primary"
    const { background, controlBackground, active, textProps } =
        useWidgetTheme(color)
    const hasValue = !isNaN(value)
    const widgetSize = useWidgetSize(variant, services?.length)
    const tvalue = hasValue ? `${Math.round(value * 100)}%` : `--`

    const mx = 5
    const wx = 6
    const n = 8
    const w = (wx + mx) * n + 2 * mx
    const mty = 42
    const mby = mx
    const hy = w * 2
    const h = hy + mty + mby
    const r = 1

    const onChange = (event: unknown, newValue: number | number[]): void => {
        const svalue = newValue as number
        server?.reading.setValues([svalue])
        levelRegister.refresh()
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SvgWidget width={w} height={h} size={widgetSize}>
                    <rect
                        fill={background}
                        x={0}
                        y={0}
                        width={w}
                        height={h}
                        r={r}
                    />
                    {Array(n)
                        .fill(0)
                        .map((_, i) => (
                            <path
                                key={`back${i}`}
                                stroke={controlBackground}
                                d={`M ${2 * mx + i * (wx + mx)} ${
                                    h - mby
                                } v ${-hy}`}
                                strokeWidth={wx}
                                strokeLinecap={i % 2 === 0 ? "round" : "square"}
                            />
                        ))}
                    {hasValue &&
                        Array(n)
                            .fill(0)
                            .map((_, i) => (
                                <path
                                    key={`water${i}`}
                                    stroke={active}
                                    d={`M ${2 * mx + i * (wx + mx)} ${
                                        h - mby - 2
                                    } v ${-hy * value}`}
                                    strokeWidth={wx + 2}
                                    strokeLinecap={"square"}
                                />
                            ))}
                    {tvalue && (
                        <text key="text" x={w >> 1} y={mty >> 1} {...textProps}>
                            {tvalue}
                        </text>
                    )}
                </SvgWidget>
            </Grid>
            {server && hasValue && (
                <Grid item xs>
                    <Slider
                        valueLabelDisplay="off"
                        min={0}
                        max={1}
                        step={0.05}
                        value={value}
                        onChange={onChange}
                        color={color}
                    />
                </Grid>
            )}
        </Grid>
    )
}
