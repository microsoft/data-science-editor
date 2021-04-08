import React, { lazy, useCallback } from "react"
import { AccelerometerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import SensorServer from "../../../jacdac-ts/src/servers/sensorserver"
import { JDRegister } from "../../../jacdac-ts/src/jdom/register"
import { Grid, Mark, NoSsr } from "@material-ui/core"
import { roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils"
import { Vector } from "../widgets/threeutils"
import LoadingProgress from "../ui/LoadingProgress"
import Suspense from "../ui/Suspense"
import SliderWithLabel from "../ui/SliderWithLabel"

const CanvasWidget = lazy(() => import("../widgets/CanvasWidget"))

const valueDisplay = (v: number) => roundWithPrecision(v, 1)
function Sliders(props: {
    server: SensorServer<[number, number, number]>
    register: JDRegister
    visible?: boolean
}) {
    const { server, register } = props
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
        const n = (newValue as any) as number
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
        const n = (newValue as any) as number
        const nz = -Math.sqrt(1 - (x * x + n * n))
        server.reading.setValues([x, n, nz])
        await register.sendGetAsync()
    }

    if (!forces?.length) return <LoadingProgress />
    const [x, y] = forces
    const min = -2
    const max = 2
    const step = 0.1
    const marks: Mark[] = [
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
                    label="X"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="x"
                    min={min}
                    max={max}
                    step={step}
                    value={x}
                    onChange={handleChangeX}
                    marks={marks}
                />
            </Grid>
            <Grid item xs={12}>
                <SliderWithLabel
                    label="Y"
                    valueLabelDisplay="auto"
                    valueLabelFormat={valueDisplay}
                    aria-label="y"
                    min={min}
                    max={max}
                    step={step}
                    value={y}
                    onChange={handleChangeY}
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
    const register = service.register(AccelerometerReg.Forces)
    const server = useServiceServer<SensorServer<[number, number, number]>>(
        service
    )
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
            {server && (
                <Sliders server={server} register={register} visible={visible} />
            )}
        </Grid>
    )
}
