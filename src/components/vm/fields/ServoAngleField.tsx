import { Grid, Slider } from "@material-ui/core"
import React, { ReactNode, useState } from "react"
import ServoWidget from "../../widgets/ServoWidget"
import { ReactField } from "./ReactField"

export interface ServoAngleFieldValue {
    angle: number
}

function ServoFieldWithSlider(props: {
    initialAngle: number
    onChange: (v: number) => void
}) {
    const { initialAngle = 0, onChange } = props
    const [angle, setAngle] = useState(initialAngle)
    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        const newAngle = newValue as number
        setAngle(newAngle)
        onChange(newAngle)
    }
    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <ServoWidget
                    angle={angle}
                    offset={0}
                    color="secondary"
                    enabled={true}
                />
            </Grid>
            <Grid item xs={12}>
                <Slider
                    color="secondary"
                    valueLabelDisplay="auto"
                    valueLabelFormat={`${Math.round(angle)}°`}
                    min={-90}
                    max={90}
                    step={5}
                    value={angle}
                    onChange={handleChange}
                    aria-label="angle"
                />
            </Grid>
        </Grid>
    )
}

export default class ServoAngleField extends ReactField<ServoAngleFieldValue> {
    static KEY = "jacdac_field_servo_angle"

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(options: any) {
        return new ServoAngleField(options?.value, undefined, options)
    }

    get defaultValue() {
        return { angle: 0 }
    }

    getText_() {
        const { angle } = this.value
        return (angle || 0) + "°"
    }

    renderField(): ReactNode {
        const { angle = 0 } = this.value
        const handleChange = (newAngle: number) => {
            this.value = { angle: newAngle as number }
        }
        return (
            <ServoFieldWithSlider
                initialAngle={angle}
                onChange={handleChange}
            />
        )
    }
}
