import React from "react"
import { WindDirectionReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import { useId } from "react"
import useThrottledValue from "../hooks/useThrottledValue"
import { Grid, Slider } from "@mui/material"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import useRegister from "../hooks/useRegister"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardWindDirection(props: DashboardServiceProps) {
    const { service } = props

    const directionRegister = useRegister(
        service,
        WindDirectionReg.WindDirection
    )
    const [direction] = useRegisterUnpackedValue<[number]>(
        directionRegister,
        props
    )

    const server = useServiceServer<SensorServer<[number]>>(service)
    const color = server ? "secondary" : "primary"
    const { background, controlBackground, active } = useWidgetTheme(color)
    const arrowHeadId = useId()
    const widgetSize = `clamp(3rem, 10vw, 10vh)`

    const a = useThrottledValue(direction, 360)

    if (direction === undefined)
        return <DashboardRegisterValueFallback register={directionRegister} />

    const w = 64
    const h = 64
    const mw = 5
    const mh = 4.5
    const r = (w >> 1) - 4
    const sw = 3
    const cx = w >> 1
    const cy = (h * 4) / 5
    const cy2 = (h * 2) / 5

    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        await server?.reading.setValues([newValue as number])
        directionRegister.refresh()
    }

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <SvgWidget width={w} height={h} size={widgetSize}>
                    <defs>
                        <marker
                            id={arrowHeadId}
                            markerWidth={mw}
                            markerHeight={mh}
                            refX={0}
                            refY={mh / 2}
                            orient="auto"
                        >
                            <polygon
                                fill={active}
                                points={`0 0, ${mw} ${mh / 2}, 0 ${mh}`}
                            />
                        </marker>
                    </defs>
                    <g transform={`rotate(${a}, ${w >> 1}, ${h >> 1})`}>
                        <circle
                            cx={w >> 1}
                            cy={h >> 1}
                            r={r}
                            fill={controlBackground}
                            stroke={background}
                            strokeWidth={sw}
                        />
                        <line
                            x1={cx}
                            y1={cy}
                            x2={cx}
                            y2={cy2}
                            stroke={active}
                            strokeWidth={sw}
                            markerEnd={`url(#${arrowHeadId})`}
                            aria-label={`arrow point at ${direction}°`}
                        />
                    </g>
                </SvgWidget>
            </Grid>
            {server && (
                <Grid item>
                    <Slider
                        color={color}
                        valueLabelDisplay="auto"
                        min={0}
                        max={360}
                        step={5}
                        value={direction}
                        onChange={handleChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
