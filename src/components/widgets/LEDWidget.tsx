import React from "react"
import SvgWidget from "../widgets/SvgWidget"
import { Grid, Typography } from "@mui/material"
import useWidgetTheme from "../widgets/useWidgetTheme"
import SliderWithLabel from "../ui/SliderWithLabel"
import ColorButtons from "./ColorButtons"
import { rgbToHtmlColor } from "../../../jacdac-ts/src/jdom/utils"

// https://academo.org/demos/wavelength-to-colour-relationship/#:~:text=According%20to%20your%20tool%2C%20light%20at%20405nm%20corresponds,%280%2C0%2C255%29%2C%20has%20a%20quite%20longer%20wavelength%20of%20440nm.
function nmToRGB(wavelength: number): number {
    const Gamma = 0.8
    const IntensityMax = 255
    let factor: number, red: number, green: number, blue: number
    if (wavelength >= 380 && wavelength < 440) {
        red = -(wavelength - 440) / (440 - 380)
        green = 0.0
        blue = 1.0
    } else if (wavelength >= 440 && wavelength < 490) {
        red = 0.0
        green = (wavelength - 440) / (490 - 440)
        blue = 1.0
    } else if (wavelength >= 490 && wavelength < 510) {
        red = 0.0
        green = 1.0
        blue = -(wavelength - 510) / (510 - 490)
    } else if (wavelength >= 510 && wavelength < 580) {
        red = (wavelength - 510) / (580 - 510)
        green = 1.0
        blue = 0.0
    } else if (wavelength >= 580 && wavelength < 645) {
        red = 1.0
        green = -(wavelength - 645) / (645 - 580)
        blue = 0.0
    } else if (wavelength >= 645 && wavelength < 781) {
        red = 1.0
        green = 0.0
        blue = 0.0
    } else {
        red = 0.0
        green = 0.0
        blue = 0.0
    }
    // Let the intensity fall off near the vision limits
    if (wavelength >= 380 && wavelength < 420) {
        factor = 0.3 + (0.7 * (wavelength - 380)) / (420 - 380)
    } else if (wavelength >= 420 && wavelength < 701) {
        factor = 1.0
    } else if (wavelength >= 701 && wavelength < 781) {
        factor = 0.3 + (0.7 * (780 - wavelength)) / (780 - 700)
    } else {
        factor = 0.0
    }
    if (red !== 0) {
        red = Math.round(IntensityMax * Math.pow(red * factor, Gamma))
    }
    if (green !== 0) {
        green = Math.round(IntensityMax * Math.pow(green * factor, Gamma))
    }
    if (blue !== 0) {
        blue = Math.round(IntensityMax * Math.pow(blue * factor, Gamma))
    }
    return ((red & 0xff) << 16) | ((green & 0xff) << 8) | (blue & 0xff)
}

export default function LEDWidget(props: {
    color: "primary" | "secondary"
    waveLength?: number
    ledCount?: number
    ledColor: number
    onLedColorChange?: (newLedColor: number) => void
    speed?: number
    onSpeedChange?: (newSpeed: number) => void
    brightness?: number
    onBrightnessChange?: (newBrightness: number) => void
}) {
    const {
        color,
        waveLength,
        ledCount,
        ledColor,
        onLedColorChange,
        speed = 32,
        onSpeedChange,
        brightness = 16,
        onBrightnessChange,
    } = props
    const r = (ledColor >> 16) & 0xff
    const g = (ledColor >> 8) & 0xff
    const b = (ledColor >> 0) & 0xff

    const { active } = useWidgetTheme(color)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSpeedChange: any = (event: unknown, newSpeed: number) =>
        onSpeedChange(newSpeed)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBrightnessChange: any = (event: unknown, newValue: number) =>
        onBrightnessChange(newValue)
    const percentValueFormat = (newValue: number) =>
        `${((newValue / 0xff) * 100) | 0}%`

    const opacity = !r && !b && !g ? 0 : 1
    const fill = `rgb(${r}, ${g}, ${b})`
    const ln = Math.min(ledCount || 1, 5)
    const lw = 15.5
    const m = 1
    const w = (lw + m) * ln
    const h = 42
    return (
        <Grid container spacing={1} alignItems="center" alignContent="center">
            <Grid item xs={12}>
                <Grid container spacing={1} direction="row">
                    <Grid item>
                        <SvgWidget width={w} height={h} size={`5em`}>
                            {Array(ln)
                                .fill(0)
                                .map((_, i) => (
                                    <g
                                        key={i}
                                        transform={`translate(${
                                            i * (lw + m)
                                        }, 0)`}
                                    >
                                        <path
                                            fill="#999"
                                            d="M14.2 13V7.1C14.2 3.2 11 0 7.1 0 3.2 0 0 3.2 0 7.1v13.7c1.9 1.9 4.4 2.9 7.1 2.8 4.6 0 8.4-2.6 8.4-5.9v-1.5c0-1.2-.5-2.3-1.3-3.2z"
                                            opacity=".65"
                                        />
                                        <path
                                            fill={active}
                                            d="M2.8 17.5l-1.2-1.4h1L5 17.5v18.6c0 .3-.5.5-1.1.5-.6 0-1.1-.2-1.1-.5zm10.1 6.7c0-.7-1.1-1.3-2.1-1.8-.4-.2-1.2-.6-1.2-.9v-3.4l2.5-2h-.9l-3.7 2v3.5c0 .7.9 1.2 1.9 1.7.4.2 1.3.8 1.3 1.1v16.9c0 .4.5.7 1.1.7.6 0 1.1-.3 1.1-.7z"
                                            stroke="#8c8c8c"
                                            strokeWidth="1px"
                                        />
                                        <path
                                            opacity={opacity}
                                            fill={fill}
                                            d="M14.2 13V7.1C14.2 3.2 11 0 7.1 0 3.2 0 0 3.2 0 7.1v13.7c1.9 1.9 4.4 2.9 7.1 2.8 4.6 0 8.4-2.6 8.4-5.9v-1.5c0-1.2-.5-2.3-1.3-3.2z"
                                        />
                                        <path
                                            fill="#d1d1d1"
                                            d="M14.2 13v3.1c0 2.7-3.2 5-7.1 5-3.9 0-7.1-2.2-7.1-5v4.6c1.9 1.9 4.4 2.9 7.1 2.8 4.6 0 8.4-2.6 8.4-5.9v-1.5c0-1.1-.5-2.2-1.3-3.1z"
                                            opacity=".9"
                                        />
                                        <path
                                            fill="#e6e6e6"
                                            d="M14.2 13v3.1c0 2.7-3.2 5-7.1 5-3.9 0-7.1-2.2-7.1-5v4.6c1.9 1.9 4.4 2.9 7.1 2.8 4.6 0 8.4-2.6 8.4-5.9v-1.5c0-1.1-.5-2.2-1.3-3.1z"
                                            opacity=".7"
                                        />
                                        <path
                                            fill="#e6e6e6"
                                            d="M14.2 13v3.1c0 2.7-3.2 5-7.1 5-3.9 0-7.1-2.2-7.1-5v3.1c1.9 1.9 4.4 2.9 7.1 2.8 4.6 0 8.4-2.6 8.4-5.9 0-1.1-.5-2.2-1.3-3.1z"
                                            opacity=".25"
                                        />
                                        <ellipse
                                            cx="-7.2"
                                            cy="-16.1"
                                            fill="#e6e6e6"
                                            opacity=".25"
                                            rx="7.1"
                                            ry="5"
                                            transform="scale(-1)"
                                        />
                                        <ellipse
                                            cx="-7.2"
                                            cy="-16.1"
                                            fill="#e6e6e6"
                                            opacity=".25"
                                            rx="7.1"
                                            ry="5"
                                            transform="scale(-1)"
                                        />
                                        <path
                                            opacity=".61"
                                            fill="#fff"
                                            d="M7.2 22c-4.3 0-6.1-2-6.1-2l.7-.7S3.4 21 7.2 21c2.4.1 4.7-.9 6.3-2.7l.8.6C12.4 21 9.9 22.1 7.2 22z"
                                        />
                                        <path
                                            opacity=".61"
                                            fill="#fff"
                                            d="M2.6 3.2C1.5 4.3.9 5.8.9 7.4v10.3l1.9 1.5V8.8c-.9-2.8-.3-4.2.7-5.2-.3-.1-.6-.2-.9-.4zm7.3-1.6l-.3.9c1.5.7 2.6 2.1 2.8 3.7h1c-.3-2-1.6-3.7-3.5-4.6z"
                                        />
                                    </g>
                                ))}
                        </SvgWidget>
                    </Grid>
                    <Grid item>
                        <Typography variant="caption">
                            {rgbToHtmlColor(ledColor)}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            {onLedColorChange && (
                <Grid item xs={12}>
                    <ColorButtons
                        color={ledColor}
                        onColorChange={onLedColorChange}
                    />
                </Grid>
            )}
            {onSpeedChange && (
                <Grid item xs={12}>
                    <SliderWithLabel
                        label={"speed"}
                        min={0}
                        step={5}
                        max={255}
                        value={speed}
                        valueLabelDisplay="auto"
                        valueLabelFormat={percentValueFormat}
                        onChange={handleSpeedChange}
                    />
                </Grid>
            )}
            {onBrightnessChange && (
                <Grid item xs={12}>
                    <SliderWithLabel
                        label={"brightness"}
                        min={0}
                        step={5}
                        max={255}
                        value={brightness}
                        valueLabelDisplay="auto"
                        valueLabelFormat={percentValueFormat}
                        onChange={handleBrightnessChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
