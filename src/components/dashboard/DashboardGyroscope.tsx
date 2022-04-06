import React, { useCallback } from "react"
import { GyroscopeReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { Grid, NoSsr } from "@mui/material"
import { roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils"
import CanvasWidget from "../widgets/CanvasWidget"
import { Vector } from "../widgets/threeutils"
import Suspense from "../ui/Suspense"
import SliderWithLabel from "../ui/SliderWithLabel"
import useRegister from "../hooks/useRegister"
import MaxReadingField from "./MaxReadingField"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

function Sliders(props: {
    server: SensorServer<[number, number, number]>
    register: JDRegister
    visible: boolean
}) {
    const { server, register, visible } = props
    const rates = useRegisterUnpackedValue<[number, number, number]>(register, {
        visible,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeX: any = (
        event: unknown,
        newValue: number | number[]
    ) => {
        const [, y, z] = server.reading.values()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = newValue as any as number
        server.reading.setValues([n, y, z])
        register.sendGetAsync()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeY: any = (
        event: unknown,
        newValue: number | number[]
    ) => {
        const [x, , z] = server.reading.values()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = newValue as any as number
        server.reading.setValues([x, n, z])
        register.sendGetAsync()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeZ: any = (
        event: unknown,
        newValue: number | number[]
    ) => {
        const [x, y] = server.reading.values()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = newValue as any as number
        server.reading.setValues([x, y, n])
        register.sendGetAsync()
    }
    const valueDisplay = (v: number) => `${roundWithPrecision(v, 1)}°/s`

    if (!rates?.length)
        return <DashboardRegisterValueFallback register={register} />
    const [x, y, z] = rates
    const step = 1
    const marks = [
        {
            value: 0,
        },
    ]
    return (
        <>
            <Grid item xs={12}>
                <SliderWithLabel
                    label="X"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="x rotation rate slider"
                    min={-180}
                    max={180}
                    step={step}
                    value={x}
                    marks={marks}
                    onChange={handleChangeX}
                />
            </Grid>
            <Grid item xs={12}>
                <SliderWithLabel
                    label={"Y"}
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="y rotation rate slider"
                    min={-180}
                    max={180}
                    step={step}
                    value={y}
                    marks={marks}
                    onChange={handleChangeY}
                />
            </Grid>
            <Grid item xs={12}>
                <SliderWithLabel
                    label="Z"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="z rotation rate slider"
                    min={-180}
                    max={180}
                    step={step}
                    value={z}
                    marks={marks}
                    onChange={handleChangeZ}
                />
            </Grid>
        </>
    )
}

export default function DashboardGyroscope(props: DashboardServiceProps) {
    const { service, visible } = props
    const register = useRegister(service, GyroscopeReg.RotationRates)
    useRegisterUnpackedValue<[number, number, number]>(register, props)
    const server =
        useServiceServer<SensorServer<[number, number, number]>>(service)
    const color = server ? "secondary" : "primary"
    const { active } = useWidgetTheme(color)
    const rotator = useCallback(
        (delta, rotation: Vector) => {
            const rates = register.unpackedValue
            if (!rates) return

            const [x, y, z] = rates // degrees
            const degreesToRadians = Math.PI / 180
            const f = delta * degreesToRadians
            return {
                x: rotation.x - x * f,
                y: rotation.y - z * f,
                z: rotation.z - y * f,
            }
        },
        [register]
    )

    return (
        <Grid container direction="row">
            <Grid item>
                <NoSsr>
                    <Suspense>
                        <CanvasWidget color={active} rotator={rotator} />
                    </Suspense>
                </NoSsr>
            </Grid>
            {server && (
                <Sliders
                    server={server}
                    register={register}
                    visible={visible}
                />
            )}
            <MaxReadingField registerCode={GyroscopeReg.MaxRate} {...props} />
        </Grid>
    )
}
