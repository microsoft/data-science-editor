import { Grid, Slider } from "@material-ui/core"
import React, { ReactNode, useContext } from "react"
import ReactField from "./ReactField"
import ValueContext, { ValueContextProps } from "./ValueContext"

function FieldWithSlider(props: { children: ReactNode }) {
    const { children } = props
    const { value, onValueChange } =
        useContext<ValueContextProps<number>>(ValueContext)
    const handleChange = async (ev: unknown, nv: number | number[]) => {
        const newValue = nv as number
        onValueChange(newValue)
    }
    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                {children}
            </Grid>
            <Grid item xs={12}>
                <Slider
                    color="secondary"
                    valueLabelDisplay="auto"
                    valueLabelFormat={`${Math.round(value)}°`}
                    min={-90}
                    max={90}
                    step={5}
                    value={value}
                    onChange={handleChange}
                    aria-label="angle"
                />
            </Grid>
        </Grid>
    )
}

export default class SliderField extends ReactField<number> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(value: string, options?: any) {
        super(value, undefined, options)
    }

    get defaultValue() {
        return 0
    }

    getText_() {
        return this.value + ""
    }

    renderField(): ReactNode {
        return <FieldWithSlider>{this.renderWidget()}</FieldWithSlider>
    }

    renderWidget(): ReactNode {
        return null
    }
}
