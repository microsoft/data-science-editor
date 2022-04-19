import { Button, Grid, Slider } from "@mui/material"
import React, { useEffect, useRef } from "react"
import {
    HidJoystickCmd,
    HidJoystickReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import SliderWithLabel from "../ui/SliderWithLabel"

function AxisWidget(props: DashboardServiceProps) {
    const { service } = props

    const axisCountRegister = useRegister(service, HidJoystickReg.AxisCount)
    const [axisCount = 0] = useRegisterUnpackedValue(axisCountRegister, props)
    const axis = useRef<number[]>(new Array(axisCount).fill(0))
    useEffect(() => {
        axis.current = new Array(axisCount).fill(0)
    }, [axisCount])

    // axis
    const sendAxis = () =>
        service.sendCmdPackedAsync(HidJoystickCmd.SetAxis, [
            axis.current.map(v => [v]),
        ])
    const handleAxisChange =
        (index: number) =>
        async (event: Event, newValue: number | number[]) => {
            const nv = newValue as number
            axis.current[index] = nv
            await sendAxis()
        }

    return (
        <Grid container spacing={2}>
            {Array(axisCount)
                .fill(0)
                .map((_, i) => (
                    <Grid item xs={6} key={`axis${i}`}>
                        <SliderWithLabel
                            size="small"
                            label={`AXIS ${i}`}
                            title={`axis ${i}`}
                            min={-1}
                            max={1}
                            step={0.1}
                            marks
                            defaultValue={0}
                            onChange={handleAxisChange(i)}
                        />
                    </Grid>
                ))}
        </Grid>
    )
}

function ButtonsWidget(props: DashboardServiceProps) {
    const { service } = props

    const buttonCountRegister = useRegister(service, HidJoystickReg.ButtonCount)
    const [buttonCount = 0] = useRegisterUnpackedValue(
        buttonCountRegister,
        props
    )
    const buttons = useRef<number[]>(new Array(buttonCount).fill(0))
    // update size
    useEffect(() => {
        buttons.current = new Array(buttonCount).fill(0)
    }, [buttonCount])

    // buttons
    const sendButtons = () =>
        service.sendCmdPackedAsync(HidJoystickCmd.SetButtons, [
            buttons.current.map(v => [v]),
        ])
    const handleButtonDown = (index: number) => async () => {
        buttons.current[index] = 1
        await sendButtons()
    }
    const handleButtonUp = (index: number) => async () => {
        buttons.current[index] = 0
        await sendButtons()
    }

    return (
        <Grid container spacing={1}>
            {Array(buttonCount)
                .fill(0)
                .map((_, i) => (
                    <Grid item key={`button${i}`}>
                        <Button
                            size="small"
                            variant="outlined"
                            title={`button ${i}`}
                            onPointerDown={handleButtonDown(i)}
                            onPointerUp={handleButtonUp(i)}
                        >
                            B{i}
                        </Button>
                    </Grid>
                ))}
        </Grid>
    )
}

export default function DashboardHIDJoystick(props: DashboardServiceProps) {
    return (
        <Grid container spacing={1} direction="row">
            <Grid xs={12} item>
                <ButtonsWidget {...props} />
            </Grid>
            <Grid xs={12} item>
                <AxisWidget {...props} />
            </Grid>
        </Grid>
    )
}
