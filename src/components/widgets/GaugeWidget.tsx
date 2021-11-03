import React, { SVGAttributes, useRef } from "react"
import useWidgetTheme from "./useWidgetTheme"
import SvgWidget from "./SvgWidget"
import useThrottledValue from "../hooks/useThrottledValue"
import { closestPoint, describeArc, svgPointerPoint } from "./svgutils"
import { CSSProperties } from "@mui/material/styles"
import PowerButton from "./PowerButton"
import { Grid, Slider } from "@mui/material"

export default function GaugeWidget(props: {
    value: number
    min: number
    max: number
    step?: number
    label?: string
    color?: "primary" | "secondary"
    size?: string
    variant?: "fountain"
    tabIndex?: number
    valueLabel?: (v: number) => string
    onChange?: (newValue: number) => void
    off?: boolean
    toggleOff?: () => void
}) {
    const {
        value,
        color,
        size,
        min,
        max,
        step,
        variant,
        valueLabel,
        off,
        toggleOff,
        onChange,
        tabIndex,
    } = props
    const { background, active, textProps } = useWidgetTheme(color)

    const sliderPathRef = useRef<SVGPathElement>()
    const w = 120
    const h = 120
    const m = 8
    const roff = 30
    const riff = 10
    const sw = m << 1
    const cx = w >> 1
    const cy = h >> 1
    const r = (w >> 1) - m
    const sa = -135
    const ea = 135
    const _step = step || (max - min) / 10
    const displayValue = useThrottledValue(value, (max - min) * 2)

    const computeArc = (v: number) => {
        if (variant === "fountain") {
            const mid = (ea + sa) / 2
            const fraction = (v / (max - min)) * (ea - sa)
            if (fraction < 0) return describeArc(cx, cy, r, mid + fraction, mid)
            else return describeArc(cx, cy, r, mid, mid + fraction)
        } else {
            const fraction = (v - min) / (max - min)
            const va = sa + fraction * (ea - sa)
            return describeArc(cx, cy, r, sa, va)
        }
    }

    const db = describeArc(cx, cy, r, sa, ea)
    const dvalue = computeArc(value)
    const dactual = computeArc(displayValue)
    const lineCap = "round"
    const tvalue =
        valueLabel !== undefined
            ? valueLabel(value)
            : value === undefined
            ? ""
            : value + ""
    const clickeable = !!onChange

    const handlePointerDown = (ev: React.PointerEvent<SVGPathElement>) => {
        ev.preventDefault()
        if (!ev.buttons) return
        const svg = sliderPathRef.current.ownerSVGElement
        const pos = svgPointerPoint(svg, ev)
        const closest = closestPoint(sliderPathRef.current, _step, pos)
        onChange(min + (1 - closest) * (max - min))
    }
    const pointerStyle: CSSProperties = clickeable && {
        cursor: "pointer",
    }
    const pathProps: SVGAttributes<SVGPathElement> = {
        onPointerDown: clickeable ? handlePointerDown : undefined,
        onPointerMove: clickeable ? handlePointerDown : undefined,
        style: clickeable ? pointerStyle : undefined,
    }
    const handleSliderChange = (ev: unknown, newValue: number | number[]) =>
        onChange(newValue as number)

    return (
        <Grid container direction="column">
            <Grid item>
                <SvgWidget tabIndex={tabIndex} width={w} height={h} size={size}>
                    <path
                        ref={sliderPathRef}
                        strokeWidth={sw}
                        stroke={background}
                        d={db}
                        strokeLinecap={lineCap}
                        fill="transparent"
                        {...pathProps}
                    />
                    {!off && (
                        <path
                            strokeWidth={sw}
                            stroke={active}
                            strokeLinecap={lineCap}
                            d={dvalue}
                            opacity={0.2}
                            fill="transparent"
                            {...pathProps}
                        />
                    )}
                    {!off && (
                        <path
                            strokeWidth={sw}
                            stroke={active}
                            strokeLinecap={lineCap}
                            d={dactual}
                            fill="transparent"
                            {...pathProps}
                        />
                    )}
                    {off !== undefined ? (
                        <PowerButton
                            off={off}
                            label={tvalue}
                            cx={cx}
                            cy={cy}
                            r={roff}
                            ri={riff}
                            color={color}
                            onClick={toggleOff}
                        />
                    ) : (
                        <text {...textProps} x={cx} y={cy} aria-label={tvalue}>
                            {tvalue}
                        </text>
                    )}
                </SvgWidget>
            </Grid>
            {clickeable && (
                <Grid item>
                    <Slider
                        disabled={off}
                        color={color}
                        min={min}
                        max={max}
                        step={_step}
                        valueLabelDisplay="off"
                        value={value}
                        onChange={onChange ? handleSliderChange : undefined}
                    />
                </Grid>
            )}
        </Grid>
    )
}
