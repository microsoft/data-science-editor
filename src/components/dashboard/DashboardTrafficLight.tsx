
import React, { useRef } from "react";
import { TrafficLightReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue";
import SvgWidget from "../widgets/SvgWidget";
import useWidgetTheme from "../widgets/useWidgetTheme";
import useServiceHost from "../hooks/useServiceHost";
import useWidgetSize from "../widgets/useWidgetSize";
import useSvgButtonProps from "../hooks/useSvgButtonProps";
import TrafficLightServiceHost from "../../../jacdac-ts/src/hosts/trafficlightservicehost";
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps";

const m = 2;
const r = 8;
const ri = 7;
const w = 2 * r + 2 * m;
const h = 4 * w + 2 * m;
const cx = w / 2;
const sw = 2;

function TrafficLight(props: { cx: number, cy: number, label: string, background: string, fill: string, onDown?: () => void }) {
    const { cx, cy, fill, background, label, onDown } = props;
    const buttonProps = useSvgButtonProps<SVGCircleElement>(label, onDown);

    return <>
        <circle cx={cx} cy={cy} r={r} fill={background} stroke={"none"} />
        <circle cx={cx} cy={cy} r={ri} fill={fill} strokeWidth={sw} {...buttonProps} />
    </>;
}

export default function DashboardTrafficLight(props: DashboardServiceProps) {
    const { service, services, variant } = props;

    const widgetRef = useRef<SVGGElement>();
    const red = useRegisterBoolValue(service.register(TrafficLightReg.Red), props)
    const orange = useRegisterBoolValue(service.register(TrafficLightReg.Orange), props)
    const green = useRegisterBoolValue(service.register(TrafficLightReg.Green), props)

    const lightRegs = [TrafficLightReg.Red, TrafficLightReg.Orange, TrafficLightReg.Green]
    const lights = [red, orange, green]

    const host = useServiceHost<TrafficLightServiceHost>(service);
    const color = host ? "secondary" : "primary";
    const { background, controlBackground } = useWidgetTheme(color)
    const widgetSize = useWidgetSize(variant, services.length)

    let cy = 0;
    const names = [
        "red",
        "yellow",
        "green"
    ]
    const colors = [
        "red",
        "orange",
        "green"
    ]
    const navProps = useKeyboardNavigationProps(widgetRef.current)
    return <SvgWidget width={w} height={h} size={widgetSize}>
        <g ref={widgetRef} {...navProps}>
            <rect x={0} y={0} width={w} height={h} rx={m} fill={background} />
            {lights.map((v, i) => {
                cy += m + 2 * r;
                const fill = v ? colors[i] : controlBackground;
                const onDown = async () => {
                    const reg = service.register(lightRegs[i]);
                    await reg.sendSetBoolAsync(!v, true)
                }
                return <TrafficLight
                    key={i} cx={cx} cy={cy}
                    background={background}
                    fill={fill}
                    onDown={onDown}
                    label={`${names[i]} ${v ? "on" : "off"}`} />
            })}
        </g>
    </SvgWidget>;
}