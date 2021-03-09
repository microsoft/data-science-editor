import React from "react";
import { ColorReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useServiceHost from "../hooks/useServiceHost";
import SensorServiceHost from "../../../jacdac-ts/src/hosts/sensorservicehost";
import { BlockPicker } from "react-color"
import SvgWidget from "../widgets/SvgWidget";
import useWidgetTheme from "../widgets/useWidgetTheme";
import LoadingProgress from "../ui/LoadingProgress";

export default function DashboardColor(props: DashboardServiceProps) {
    const { service, services, variant } = props;
    const register = service.register(ColorReg.Color);
    const [r, g, b] = useRegisterUnpackedValue<[number, number, number]>(register);
    const host = useServiceHost<SensorServiceHost<[number, number, number]>>(service);
    const color = host ? "secondary" : "primary";
    const { background, textProps } = useWidgetTheme(color)

    if (r === undefined)
        return <LoadingProgress />;

    const value = `rgb(${(r * 0xff) >> 0}, ${(g * 0xff) >> 0}, ${(b * 0xff) >> 0})`
    const handleChange = (color: { rgb: { r: number, g: number, b: number } }) => {
        console.log({ color })
        const { rgb } = color;
        host.reading.setValues([rgb.r / 0xff, rgb.g / 0xff, rgb.b / 0xff])
        register.refresh();
    }
    const w = 64;
    const rx = 4;
    if (host)
        return <BlockPicker color={value} triangle="hide" onChangeComplete={host && handleChange} />
    else
        return <SvgWidget width={w} height={w}>
            <rect x={0} y={0} width={w} height={w} rx={rx} ry={rx} fill={value}
                stroke={background}
                strokeWidth={2}
                tabIndex={0}
                aria-live="polite"
                aria-label={`color ${value} detected`}
            />
        </SvgWidget>

}