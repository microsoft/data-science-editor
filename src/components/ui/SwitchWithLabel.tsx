import { FormControlLabel, Switch, SwitchProps } from "@material-ui/core"
import React from "react"

export default function SwitchWithLabel(
    props: { label: string } & SwitchProps
) {
    const { label, ...rest } = props
    return <FormControlLabel control={<Switch {...rest} />} label={label} />
}
