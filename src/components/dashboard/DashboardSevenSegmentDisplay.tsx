import React from "react"
import { SevenSegmentDisplayReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterBoolValue, useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceProvider from "../hooks/useServiceProvider"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import { Grid } from "@material-ui/core"
import RegisterInput from "../RegisterInput"
import LoadingProgress from "../ui/LoadingProgress"
import useServiceServer from "../hooks/useServiceServer"

export default function DashboardSevenSegmentDisplay(
    props: DashboardServiceProps
) {
    const { service, visible } = props

    const [digits] = useRegisterUnpackedValue<[Uint8Array]>(
        service.register(SevenSegmentDisplayReg.Digits)
    ) || [new Uint8Array(0)]
    const brightnessRegister = service.register(
        SevenSegmentDisplayReg.Brightness
    )
    const [brightness] = useRegisterUnpackedValue<[number]>(brightnessRegister, props)
    const [digitCount] = useRegisterUnpackedValue<[number]>(
        service.register(SevenSegmentDisplayReg.DigitCount),
        props
    )
    const decimalPoint = useRegisterBoolValue(
        service.register(SevenSegmentDisplayReg.DecimalPoint),
        props
    )

    const server = useServiceServer(service)
    const color = server ? "secondary" : "primary"
    const { active, background } = useWidgetTheme(color)

    if (digitCount === undefined) return <LoadingProgress />

    const md = 4
    const rs = 4
    const hs = 32
    const ws = 28
    const wd = ws + 2 * rs
    const hd = 2 * rs

    const w = digitCount * (wd + 4 * md) + md
    const h = 2 * md + 3 * hd + 2 * hs
    const opacity = brightness || 0

    /*
    GFEDCBA DP
    - A -
    |   |
    G   B
    |   |
    - F -
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
        const bit = (props.digit & 0x80) == 0x80
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
                <VerticalSegment
                    key="G"
                    mx={rs}
                    my={rs}
                    digit={digit}
                    mask={0x01}
                />

                <HorizontalSegment
                    key="F"
                    mx={rs}
                    my={rs + hs + hd}
                    digit={digit}
                    mask={0x02}
                />

                <VerticalSegment
                    key="E"
                    mx={rs}
                    my={rs + hd + hs}
                    digit={digit}
                    mask={0x04}
                />

                <HorizontalSegment
                    key="D"
                    mx={rs}
                    my={rs + 2 * hd + 2 * hs}
                    digit={digit}
                    mask={0x08}
                />

                <VerticalSegment
                    key="C"
                    mx={rs + wd}
                    my={rs + hd + hs}
                    digit={digit}
                    mask={0x10}
                />
                <VerticalSegment
                    key="B"
                    mx={rs + wd}
                    my={rs}
                    digit={digit}
                    mask={0x20}
                />

                <HorizontalSegment
                    key="A"
                    mx={rs}
                    my={rs}
                    digit={digit}
                    mask={0x40}
                />

                {decimalPoint && <DotSegment digit={digit} />}
            </g>
        )
    }

    return (
        <Grid container direction="column">
            <Grid item xs={12}>
                <SvgWidget width={w} height={h}>
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
            <Grid item>
                <RegisterInput register={brightnessRegister} visible={visible} />
            </Grid>
        </Grid>
    )
}
