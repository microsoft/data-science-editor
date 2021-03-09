import React, { Suspense, useCallback } from "react";
import { GyroscopeReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useWidgetTheme from "../widgets/useWidgetTheme";
import useServiceHost from "../hooks/useServiceHost";
import SensorServiceHost from "../../../jacdac-ts/src/hosts/sensorservicehost";
import { JDRegister } from "../../../jacdac-ts/src/jdom/register";
import { Grid, Mark, NoSsr, Slider } from "@material-ui/core";
import { roundWithPrecision } from "../../../jacdac-ts/src/jdom/utils";
import CanvasWidget from "../widgets/CanvasWidget";
import { Vector } from "../widgets/threeutils";
import LoadingProgress from "../ui/LoadingProgress";

function Sliders(props: { host: SensorServiceHost<[number, number, number]>, register: JDRegister }) {
    const { host, register } = props;
    const rates = useRegisterUnpackedValue<[number, number, number]>(register);
    const handleChangeX = (event: unknown, newValue: number | number[]) => {
        const [, y, z] = host.reading.values();
        const n = newValue as any as number;
        host.reading.setValues([n, y, z]);
        register.sendGetAsync()
    }
    const handleChangeY = (event: unknown, newValue: number | number[]) => {
        const [x, , z] = host.reading.values();
        const n = newValue as any as number;
        host.reading.setValues([x, n, z]);
        register.sendGetAsync()
    }
    const handleChangeZ = (event: unknown, newValue: number | number[]) => {
        const [x, y] = host.reading.values();
        const n = newValue as any as number;
        host.reading.setValues([x, y, n]);
        register.sendGetAsync()
    }
    const valueDisplay = (v: number) => `${roundWithPrecision(v, 1)}°/s`

    if (!rates?.length)
        return <LoadingProgress />;
    const [x, y, z] = rates;
    const step = 1
    const marks: Mark[] = [
        {
            value: 0,
        },
    ]
    return <>
        <Grid item>
            <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={valueDisplay}
                aria-label="x rotation rate slider" orientation="vertical" min={-180} max={180} step={step}
                value={x}
                marks={marks}
                onChange={handleChangeX} />
        </Grid>
        <Grid item>
            <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={valueDisplay}
                aria-label="y rotation rate slider" orientation="vertical" min={-180} max={180} step={step}
                value={y}
                marks={marks}
                onChange={handleChangeY} />
        </Grid>
        <Grid item>
            <Slider
                valueLabelDisplay="auto"
                valueLabelFormat={valueDisplay}
                aria-label="z rotation rate slider" orientation="vertical" min={-180} max={180} step={step}
                value={z}
                marks={marks}
                onChange={handleChangeZ} />
        </Grid>
    </>
}

export default function DashboardGyroscope(props: DashboardServiceProps) {
    const { service } = props;
    const register = service.register(GyroscopeReg.RotationRates);
    const host = useServiceHost<SensorServiceHost<[number, number, number]>>(service);
    const color = host ? "secondary" : "primary"
    const { active } = useWidgetTheme(color)
    const rotator = useCallback((delta, rotation: Vector) => {
        const rates = register.unpackedValue;
        if (!rates) return;

        const [x, y, z] = rates; // degrees
        const degreesToRadians = Math.PI / 180;
        const f = delta * degreesToRadians;
        return {
            x: rotation.x + x * f,
            y: rotation.y - z * f,
            z: rotation.z - y * f
        }
    }, [register])

    return <Grid container direction="row">
        <Grid item style={({ height: "20vh", width: "20vh" })}>
            <NoSsr><Suspense fallback={<LoadingProgress />}>
                <CanvasWidget color={active} rotator={rotator} />
            </Suspense></NoSsr>
        </Grid>
        {host && <Sliders host={host} register={register} />}
    </Grid>
}