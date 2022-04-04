import React, { CSSProperties, useRef } from "react"
import { Grid, Slider, Typography } from "@mui/material"
import { renderWithPrecision } from "../../../jacdac-ts/src/jdom/utils"
import useWidgetTheme from "./useWidgetTheme"
import useUnitConverter from "../ui/useUnitConverter"
/// <reference path="../../../jacdac-ts/jacdac-spec/spectool/jdspec.d.ts" />

function useDebouncedValueTextLength(valueText: string) {
    const valueTextLength = valueText.length
    const debouncedRef = useRef(valueTextLength)
    const alpha = 0.05
    if (debouncedRef.current < valueTextLength)
        debouncedRef.current = valueTextLength
    else
        debouncedRef.current =
            debouncedRef.current * (1 - alpha) + valueTextLength * alpha
    return Math.ceil(debouncedRef.current)
}

export default function ValueWithUnitWidget(props: {
    value: number
    unit: jdspec.Unit
    min?: number
    max?: number
    step?: number
    icon?: JSX.Element
    secondaryLabel?: string
    tabIndex?: number
    color?: "primary" | "secondary"
    size?: string
    onChange?: (newValue: number) => void
}) {
    const { step, secondaryLabel, icon, unit, tabIndex, color, onChange } =
        props
    const {
        name: unitName,
        converter: unitConverter,
        inverter: unitInverter,
    } = useUnitConverter(unit)

    // map all values with unit converters
    const { value, min, max } = {
        value: unitConverter(props.value),
        min: unitConverter(props.min),
        max: unitConverter(props.max),
    }

    const precision =
        step === undefined ? 1 : step < 1 ? Math.ceil(-Math.log10(step)) : 0
    const hasValue = !isNaN(value)
    const valueText = hasValue ? renderWithPrecision(value, precision) : "--"
    const valueTextLength = useDebouncedValueTextLength(valueText)
    const { textPrimary } = useWidgetTheme(color)
    const valueVariant =
        valueTextLength < 7
            ? "h2"
            : valueTextLength < 9
            ? "h3"
            : valueTextLength < 12
            ? "h4"
            : "h6"
    const valueStyle: CSSProperties = {
        color: textPrimary,
        minWidth: `${valueTextLength / 2}em`,
        fontVariantNumeric: "tabular-nums",
    }
    const unitStyle: CSSProperties = {
        color: textPrimary,
    }
    const captionStyle: CSSProperties = {
        color: textPrimary,
    }

    const handleChange = (event: unknown, newValue: number | number[]) => {
        const v = newValue as number
        const iv = unitInverter(v)
        onChange(iv)
    }

    return (
        <Grid
            container
            direction="column"
            tabIndex={tabIndex}
            aria-label={`${valueText} ${unitName || ""}`}
        >
            <Grid item xs={12}>
                <Grid container direction="row" alignContent="flex-end">
                    <Grid item>
                        <Typography
                            role="timer"
                            align="right"
                            variant={valueVariant}
                            style={valueStyle}
                        >
                            {icon}
                            {valueText}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Grid
                            container
                            direction="column"
                            alignContent="space-between"
                        >
                            {unitName && (
                                <Grid item>
                                    <Typography
                                        style={unitStyle}
                                        variant={"caption"}
                                    >
                                        {unitName}
                                    </Typography>
                                </Grid>
                            )}
                            {secondaryLabel && (
                                <Grid item>
                                    <Typography
                                        style={captionStyle}
                                        variant={"caption"}
                                    >
                                        {secondaryLabel}
                                    </Typography>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            {onChange && value !== undefined && (
                <Grid item xs={12}>
                    <Slider
                        valueLabelDisplay="off"
                        color="secondary"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={handleChange}
                        aria-label={unitName || secondaryLabel}
                    />
                </Grid>
            )}
        </Grid>
    )
}
