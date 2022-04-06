import React, { lazy, useCallback } from "react"
import { AccelerometerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { Grid, NoSsr } from "@mui/material"
import { roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils"
import { Vector } from "../widgets/threeutils"
import Suspense from "../ui/Suspense"
import SliderWithLabel from "../ui/SliderWithLabel"
import useRegister from "../hooks/useRegister"
import { useId } from "react-use-id-hook"
import MaxReadingField from "./MaxReadingField"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"

const CanvasWidget = lazy(() => import("../widgets/CanvasWidget"))

const valueDisplay = (v: number) => roundWithPrecision(v, 1)
function Sliders(props: {
    server?: SensorServer<[number, number, number]>
    register: JDRegister
    visible?: boolean
}) {
    const { server, register } = props
    const xId = useId()
    const yId = useId()
    const zId = useId()
    const forces = useRegisterUnpackedValue<[number, number, number]>(
        register,
        props
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeX: any = async (
        event: unknown,
        newValue: number | number[]
    ) => {
        const [, y] = server.reading.values()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = newValue as any as number
        const nz = -Math.sqrt(1 - (n * n + y * y))
        server.reading.setValues([n, y, nz])
        await register.sendGetAsync()
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChangeY: any = async (
        event: unknown,
        newValue: number | number[]
    ) => {
        const [x] = server.reading.values()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const n = newValue as any as number
        const nz = -Math.sqrt(1 - (x * x + n * n))
        server.reading.setValues([x, n, nz])
        await register.sendGetAsync()
    }

    if (!forces?.length)
        return <DashboardRegisterValueFallback register={register} />

    const [x, y, z] = forces
    const min = -2
    const max = 2
    const step = 0.1
    const marks = [
        {
            value: 0,
        },
        {
            value: -1,
        },
        {
            value: 1,
        },
    ]
    return (
        <>
            <Grid item xs={12}>
                <SliderWithLabel
                    id={xId}
                    label="X"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="x"
                    min={min}
                    max={max}
                    step={step}
                    value={x}
                    onChange={server ? handleChangeX : undefined}
                    marks={marks}
                />
            </Grid>
            <Grid item xs={12}>
                <SliderWithLabel
                    id={yId}
                    label="Y"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="y"
                    min={min}
                    max={max}
                    step={step}
                    value={y}
                    onChange={server ? handleChangeY : undefined}
                    marks={marks}
                />
            </Grid>
            <Grid item xs={12}>
                <SliderWithLabel
                    id={zId}
                    label="Z"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="z"
                    min={min}
                    max={max}
                    step={step}
                    value={z}
                    marks={marks}
                />
            </Grid>
        </>
    )
}

function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t
}

export default function DashboardAccelerometer(props: DashboardServiceProps) {
    const { service, visible } = props
    const register = useRegister(service, AccelerometerReg.Forces)
    useRegisterUnpackedValue<[number, number, number]>(register, props)
    const server =
        useServiceServer<SensorServer<[number, number, number]>>(service)
    const color = server ? "secondary" : "primary"
    const { active } = useWidgetTheme(color)
    const rotator = useCallback(
        (delta: number, rotation: Vector) => {
            const forces = register.unpackedValue
            if (!forces) return undefined
            const [x, y, z] = forces
            const roll = Math.atan2(-y, z)
            const pitch = Math.atan(x / (y * y + z * z))

            return {
                x: lerp(rotation.x, roll, 0.1),
                y: 0,
                z: lerp(rotation.z, pitch, 0.1),
            }
        },
        [register]
    )

    return (
        <Grid container direction="row">
            <Grid item>
                <NoSsr>
                    <Suspense>
                        <CanvasWidget
                            showAxes={true}
                            color={active}
                            rotator={rotator}
                        />
                    </Suspense>
                </NoSsr>
            </Grid>
            <Sliders server={server} register={register} visible={visible} />
            <MaxReadingField
                registerCode={AccelerometerReg.MaxForce}
                {...props}
            />
        </Grid>
    )
}
