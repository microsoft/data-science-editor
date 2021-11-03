import { Grid, Input, Mark, Slider, Typography } from "@mui/material"
import React from "react"
import { useId } from "react-use-id-hook"

export default function InputSlider(props: {
    value: number
    color?: "primary" | "secondary"
    valueLabelFormat?:
        | string
        | ((value: number, index: number) => React.ReactNode)
    onChange?: (newValue: number) => void
    min?: number
    max?: number
    step?: number
    label?: string
    disabled?: boolean
    marks?: boolean | Mark[]
    type?: string
}) {
    const {
        min,
        max,
        step,
        label,
        disabled,
        marks,
        color,
        onChange,
        value,
        valueLabelFormat,
        type,
    } = props
    const readOnly = !onChange
    const sliderId = useId()
    const inputId = useId()
    const labelId = useId()

    const handleSliderChange = (
        event: unknown,
        newValue: number | number[]
    ) => {
        onChange(newValue as number)
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const n = parseFloat(event.target.value as string)
        if (!isNaN(n)) onChange(n)
    }

    const handleBlur = () => {
        if (value < min) {
            onChange(min)
        } else if (value > max) {
            onChange(max)
        }
    }

    return (
        <Grid container spacing={2} alignItems="center">
            {label && (
                <Grid item xs={12}>
                    <Typography variant="caption">{label}</Typography>
                </Grid>
            )}
            <Grid item xs>
                <Slider
                    id={sliderId}
                    aria-label={label}
                    aria-labelledby={labelId}
                    color={color}
                    disabled={disabled}
                    valueLabelFormat={valueLabelFormat}
                    value={value}
                    onChange={readOnly ? undefined : handleSliderChange}
                    valueLabelDisplay="auto"
                    marks={marks}
                    min={min}
                    max={max}
                    step={step}
                />
            </Grid>
            <Grid item>
                <Input
                    id={inputId}
                    aria-label={label}
                    aria-labelledby={labelId}
                    disabled={disabled}
                    value={value}
                    readOnly={readOnly}
                    margin="dense"
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    type={type}
                    inputProps={{
                        step: step,
                        min: min,
                        max: max,
                        type: "number",
                        "aria-labelledby": sliderId,
                    }}
                />
            </Grid>
        </Grid>
    )
}
