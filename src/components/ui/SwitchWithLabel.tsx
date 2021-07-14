import { FormControlLabel, Switch, SwitchProps } from "@material-ui/core"
import React, { ReactNode } from "react"

export default function SwitchWithLabel(
    props: { label: ReactNode } & SwitchProps
) {
    const { label, ...rest } = props
    return <FormControlLabel control={<Switch {...rest} />} label={label} />
}
