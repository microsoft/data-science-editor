import React from "react"
import { Grid, Slider, Typography } from "@material-ui/core"
import { isSet, roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils"
import { CSSProperties } from "@material-ui/core/styles/withStyles"
import useWidgetTheme from "./useWidgetTheme"

export default function ValueWithUnitWidget(props: {
    value: number
    min?: number
    max?: number
    step?: number
    icon?: JSX.Element
    label: string
    secondaryLabel?: string
    tabIndex?: number
    color?: "primary" | "secondary"
    size?: string
    onChange?: (event: unknown, newValue: number | number[]) => void
}) {
    const {
        value,
        min,
        max,
        step,
        secondaryLabel,
        icon,
        label,
        tabIndex,
        color,
        onChange,
    } = props
    const labelVariant = "subtitle1"
    const precision =
        step === undefined ? 1 : step < 1 ? Math.ceil(-Math.log10(step)) : 0
    const hasValue = !isNaN(value)
    const valueText = hasValue
        ? roundWithPrecision(value, precision).toLocaleString()
        : "--"
    const valueTextLength =
        isSet(min) && isSet(max)
            ? [min, max, min + (min + max) / 3]
                  .map(
                      v =>
                          roundWithPrecision(v, precision)
                              .toLocaleString()
                              .replace(/[,.]/, "").length
                  )
                  .reduce((l, r) => Math.max(l, r), 0) + precision
            : valueText.length

    const { textPrimary } = useWidgetTheme(color)
    //console.log({ min, max, step, precision })
    const valueVariant =
        valueTextLength < 4
            ? "h1"
            : valueTextLength < 7
            ? "h2"
            : valueTextLength < 9
            ? "h3"
            : valueTextLength < 12
            ? "h4"
            : "h6"
    const valueStyle: CSSProperties = {
        color: textPrimary,
        minWidth: `${Math.max(2, valueTextLength - 1)}em`,
    }
    const unitStyle: CSSProperties = {
        color: textPrimary,
    }
    const captionStyle: CSSProperties = {
        color: textPrimary,
    }

    return (
        <Grid
            container
            direction="column"
            tabIndex={tabIndex}
            aria-label={`${valueText} ${label}`}
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
                            <Grid item>
                                <Typography
                                    style={unitStyle}
                                    variant={labelVariant}
                                >
                                    {label}
                                </Typography>
                            </Grid>
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
                        onChange={onChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
