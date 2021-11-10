import { FormControlLabel, Switch, SwitchProps } from "@mui/material"
import React, { CSSProperties } from "react"

export default function SwitchWithLabel(
    props: {
        label: string | number | JSX.Element
        labelPlacement?: "end" | "start" | "top" | "bottom"
        labelStyle?: CSSProperties
    } & SwitchProps
) {
    const { label, labelPlacement, labelStyle, ...rest } = props
    return (
        <FormControlLabel
            control={<Switch {...rest} />}
            label={label}
            style={labelStyle}
            labelPlacement={labelPlacement}
        />
    )
}
