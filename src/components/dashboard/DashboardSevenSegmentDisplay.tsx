import React from "react"
import { SevenSegmentDisplayReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { Grid } from "@mui/material"
import RegisterInput from "../RegisterInput"
import useServiceServer from "../hooks/useServiceServer"
import useRegister from "../hooks/useRegister"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

export default function DashboardSevenSegmentDisplay(
    props: DashboardServiceProps
) {
    const { service, visible, expanded } = props

    const digitsRegister = useRegister(service, SevenSegmentDisplayReg.Digits)
    const brightnessRegister = useRegister(
        service,
        SevenSegmentDisplayReg.Brightness
    )
    const digitCountRegister = useRegister(
        service,
        SevenSegmentDisplayReg.DigitCount
    )
    const decimalPointRegister = useRegister(
        service,
        SevenSegmentDisplayReg.DecimalPoint
    )

    const [digits] = useRegisterUnpackedValue<[Uint8Array]>(digitsRegister) || [
        new Uint8Array(0),
    ]
    const [brightness] = useRegisterUnpackedValue<[number]>(
        brightnessRegister,
        props
    )
    const [digitCount] = useRegisterUnpackedValue<[number]>(
        digitCountRegister,
        props
    )
    const decimalPoint = useRegisterBoolValue(decimalPointRegister, props)

    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    const { active, background, controlBackground } = useWidgetTheme(color)

    if (digitCount === undefined)
        return <DashboardRegisterValueFallback register={digitCountRegister} />

    const md = 4
    const rs = 4
    const hs = 32
    const ws = 28
    const wd = ws + 2 * rs
    const hd = 2 * rs

    const w = digitCount * (wd + 4 * md) + md
    const h = 2 * md + 3 * hd + 2 * hs
    const opacity = 0.5 + 0.5 * (brightness === undefined ? 1 : brightness)

    /*
    GFEDCBA DP
    - A -
    |   |
    F   B
    |   |
    - G -
    |   |   -
    E   C  |DP|
    - D -   -
    */

    const VerticalSegment = (props: {
        digit: number
        mask: number
        mx: number
        my: number
    }) => {
        const bit = (props.digit & props.mask) == props.mask
        return (
            <>
                <path
                    fill={background}
                    stroke="none"
                    d={`M ${props.mx} ${
                        props.my
                    } l ${-rs} ${rs} v ${hs} l ${rs} ${rs} l ${rs} ${-rs} v ${-hs} Z`}
                />
                {bit && (
                    <path
                        opacity={opacity}
                        fill={active}
                        stroke="none"
                        d={`M ${props.mx} ${
                            props.my
                        } l ${-rs} ${rs} v ${hs} l ${rs} ${rs} l ${rs} ${-rs} v ${-hs} Z`}
                    />
                )}
            </>
        )
    }
    const HorizontalSegment = (props: {
        digit: number
        mask: number
        mx: number
        my: number
    }) => {
        const bit = (props.digit & props.mask) == props.mask
        return (
            <>
                <path
                    fill={background}
                    stroke="none"
                    d={`M ${props.mx} ${
                        props.my
                    } l ${rs} ${-rs} h ${ws} l ${rs} ${rs} l ${-rs} ${rs} h ${-ws} Z`}
                />
                {bit && (
                    <path
                        opacity={opacity}
                        fill={active}
                        stroke="none"
                        d={`M ${props.mx} ${
                            props.my
                        } l ${rs} ${-rs} h ${ws} l ${rs} ${rs} l ${-rs} ${rs} h ${-ws} Z`}
                    />
                )}
            </>
        )
    }

    const DotSegment = (props: { digit: number }) => {
        const bit = (props.digit & 0b10000000) == 0b10000000
        const mx = rs + wd + 2 * rs
        const my = rs + 2 * hd + 2 * hs
        return (
            <>
                <circle
                    fill={background}
                    stroke="none"
                    r={rs}
                    cx={mx}
                    cy={my}
                />
                {bit && (
                    <circle
                        opacity={opacity}
                        fill={active}
                        stroke="none"
                        r={rs}
                        cx={mx}
                        cy={my}
                    />
                )}
            </>
        )
    }

    const Digit = (dprops: { x: number; y: number; digit: number }) => {
        const { x, y, digit } = dprops
        return (
            <g transform={`translate(${x}, ${y})`}>
                <HorizontalSegment
                    key="G"
                    mx={rs}
                    my={rs + hs + hd}
                    digit={digit}
                    mask={0b01000000}
                />

                <VerticalSegment
                    key="F"
                    mx={rs}
                    my={rs}
                    digit={digit}
                    mask={0b00100000}
                />

                <VerticalSegment
                    key="E"
                    mx={rs}
                    my={rs + hd + hs}
                    digit={digit}
                    mask={0b00010000}
                />

                <HorizontalSegment
                    key="D"
                    mx={rs}
                    my={rs + 2 * hd + 2 * hs}
                    digit={digit}
                    mask={0b00001000}
                />

                <VerticalSegment
                    key="C"
                    mx={rs + wd}
                    my={rs + hd + hs}
                    digit={digit}
                    mask={0b00000100}
                />
                <VerticalSegment
                    key="B"
                    mx={rs + wd}
                    my={rs}
                    digit={digit}
                    mask={0b00000010}
                />

                <HorizontalSegment
                    key="A"
                    mx={rs}
                    my={rs}
                    digit={digit}
                    mask={0b00000001}
                />

                {decimalPoint && <DotSegment digit={digit} />}
            </g>
        )
    }

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <SvgWidget width={w} height={h} background={controlBackground}>
                    {Array(digitCount)
                        .fill(0)
                        .map((_, i) => (
                            <Digit
                                key={i}
                                x={md + (wd + 4 * md) * i}
                                y={md}
                                digit={digits?.[i] || 0}
                            />
                        ))}
                </SvgWidget>
            </Grid>
            {expanded && brightness !== undefined && (
                <Grid item>
                    <RegisterInput
                        register={brightnessRegister}
                        visible={visible}
                    />
                </Grid>
            )}
        </Grid>
    )
}
