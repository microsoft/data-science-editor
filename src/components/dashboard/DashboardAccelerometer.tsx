import React, { lazy, Suspense, useCallback } from "react";
import { AccelerometerReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useWidgetTheme from "../widgets/useWidgetTheme";
import useServiceHost from "../hooks/useServiceHost";
import SensorServiceHost from "../../../jacdac-ts/src/hosts/sensorservicehost";
import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import { Grid, Slider, Mark, CircularProgress, NoSsr } from "@material-ui/core";
import { roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils";
import { Vector } from "../widgets/threeutils";
import LoadingProgress from "../ui/LoadingProgress";

const CanvasWidget = lazy(() => import("../widgets/CanvasWidget"));

const valueDisplay = (v: number) => roundWithPrecision(v, 1)
function Sliders(props: { host: SensorServiceHost<[number, number, number]>, register: JDRegister }) {
    const { host, register } = props;
    const forces = useRegisterUnpackedValue<[number, number, number]>(register);
    const handleChangeX = useCallback((event: unknown, newValue: number | number[]) => {
        const [, y] = host.reading.values();
        const n = newValue as any as number;
        const nz = -Math.sqrt(1 - (n * n + y * y));
        host.reading.setValues([n, y, nz]);
        register.sendGetAsync()
    }, [host, register])
    const handleChangeY = useCallback((event: unknown, newValue: number | number[]) => {
        const [x,] = host.reading.values();
        const n = newValue as any as number;
        const nz = -Math.sqrt(1 - (x * x + n * n));
        host.reading.setValues([x, n, nz]);
        register.sendGetAsync()
    }, [host, register])

    if (!forces?.length)
        return <LoadingProgress />;
    const [x, y] = forces;
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
        }
    ]
    return <>
        <Grid item>
            <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={valueDisplay}
                aria-label="x" orientation="vertical" min={min} max={max} step={step}
                value={x}
                onChange={handleChangeX}
                marks={marks}
            />
        </Grid>
        <Grid item>
            <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={valueDisplay}
                aria-label="y" orientation="vertical" min={min} max={max} step={step}
                value={y}
                onChange={handleChangeY}
                marks={marks}
            />
        </Grid>
    </>
}

function lerp(v0: number, v1: number, t: number) {
    return v0 * (1 - t) + v1 * t
}

export default function DashboardAccelerometer(props: DashboardServiceProps) {
    const { service } = props;
    const register = service.register(AccelerometerReg.Forces);
    const host = useServiceHost<SensorServiceHost<[number, number, number]>>(service);
    const color = host ? "secondary" : "primary"
    const { active } = useWidgetTheme(color)
    const rotator = useCallback((delta: number, rotation: Vector) => {
        const forces = register.unpackedValue;
        if (!forces) return undefined;
        const [x, y, z] = forces;
        const roll = Math.atan2(-y, z);
        const pitch = Math.atan(x / (y * y + z * z));

        return {
            x: lerp(rotation.x, roll, 0.1),
            y: 0,
            z: lerp(rotation.z, pitch, 0.1)
        }
    }, [register])

    return <Grid container direction="row">
        <Grid item style={({ height: "20vh", width: "20vw" })}>
            <NoSsr><Suspense fallback={<LoadingProgress />}>
                <CanvasWidget showAxes={true} color={active} rotator={rotator} />
            </Suspense></NoSsr>
        </Grid>
        {host && <Sliders host={host} register={register} />}
    </Grid>
}