import { Slider, SliderProps, Typography } from "@mui/material"
import React from "react"
import { useId } from "react-use-id-hook"

export default function SliderWithLabel(
    props: {
        label?: string
    } & SliderProps
) {
    const { label, ...others } = props
    const labelId = useId()
    const sliderId = useId()

    return (
        <>
            <Typography id={labelId} variant="caption" gutterBottom>
                {label}
            </Typography>
            <Slider
                id={sliderId}
                aria-labelledby={labelId}
                aria-label={label}
                valueLabelDisplay="auto"
                {...others}
            />
        </>
    )
}
