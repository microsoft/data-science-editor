import React from "react";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue";
import SvgWidget from "../widgets/SvgWidget";
import useWidgetTheme from "../widgets/useWidgetTheme";
import { SolenoidReg } from "../../../jacdac-ts/src/jdom/constants";
import useThrottledValue from "../hooks/useThrottledValue";
import useSvgButtonProps from "../hooks/useSvgButtonProps";
import useServiceProvider from "../hooks/useServiceProvider";

export default function DashboardSolenoid(props: DashboardServiceProps) {
    const { service } = props;
    const pulledRegister = service.register(SolenoidReg.Pulled);
    const pulled = useRegisterBoolValue(pulledRegister, props);
    const host = useServiceProvider(service);
    const color = host ? "secondary" : "primary";
    const { active, background, controlBackground, textProps } = useWidgetTheme(color);

    const w = 128
    const bw = 84;
    const h = 72;
    const m = 6;
    const bh = h - 2 * m;
    const bsh = bh - 6 * m;

    const pos = useThrottledValue(pulled ? m : w - bw - 2 * m, w);
    const label = pulled ? "pull solenoid" : "push solenoid"

    const onToggle = (ev: React.PointerEvent) => {
        host?.register(SolenoidReg.Pulled)?.setValues([!pulled ? 1 : 0]);
        pulledRegister.refresh();
    }

    const buttonProps = useSvgButtonProps<SVGRectElement>(label, !!host && onToggle)

    return <SvgWidget width={w} height={h} background={background} >
        <rect x={m + pos} y={m + (bh - bsh) / 2} width={bw} height={bsh} rx={m} ry={m} fill={active} stroke={controlBackground} />
        <rect x={m} y={m} width={bw} height={bh} rx={m} ry={m} stroke={background} fill={controlBackground} {...buttonProps} />
        <text {...textProps} x={m + bw / 2} y={m + bh / 2}>{pulled ? "pulled" : "pushed"}</text>
    </SvgWidget>
}