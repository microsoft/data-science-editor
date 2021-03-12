
import React from "react";
import { ArcadeGamepadButton, ArcadeGamepadReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import SvgWidget from "../widgets/SvgWidget";
import useServiceHost from "../hooks/useServiceHost";
import useWidgetTheme from "../widgets/useWidgetTheme";
import ArcadeGamepadServiceHost from "../../../jacdac-ts/src/hosts/arcadegamepadservicehost";
import useSvgButtonProps from "../hooks/useSvgButtonProps";
import LoadingProgress from "../ui/LoadingProgress";

const buttonLabels = {
    [ArcadeGamepadButton.Left]: "\u25C4",
    [ArcadeGamepadButton.Up]: "\u25B2",
    [ArcadeGamepadButton.Down]: "\u25BC",
    [ArcadeGamepadButton.Right]: "\u25BA",
}

function ArcadeButton(props: {
    cx: number,
    cy: number,
    ro: number,
    ri: number,
    pressure: number,
    button: ArcadeGamepadButton,
    host: ArcadeGamepadServiceHost,
    onRefresh: () => void,
    color?: "primary" | "secondary"
}) {
    const { cx, cy, ro, color, pressure, ri, button, host, onRefresh } = props;
    const { textProps, active, background, controlBackground } = useWidgetTheme(color);
    const checked = (pressure || 0) > 0;
    const title = ArcadeGamepadButton[button]
    const label = buttonLabels[button] || title[0]

    const handleDown = () => {
        host?.down(button, 0.7);
        onRefresh()
    }
    const handleUp = () => {
        host?.up(button);
        onRefresh()
    }
    const buttonProps = useSvgButtonProps<SVGCircleElement>(title, handleDown, handleUp)

    return <g transform={`translate(${cx},${cy})`} aria-label={`button ${title} ${checked ? "down" : "up"}`}>
        <circle cx={0} cy={0} r={ro} fill={background} />
        <circle
            cx={0} cy={0} r={ri}
            fill={checked ? active : controlBackground}
            {...buttonProps}
        >
            <title>{title}</title>
        </circle>
        <text cx={0} cy={0} fontSize={ri} {...textProps}>{label}</text>
    </g>
}

export default function DashboardArcadeGamepad(props: DashboardServiceProps) {
    const { service } = props;
    const [available] = useRegisterUnpackedValue<[[ArcadeGamepadButton][]]>(service.register(ArcadeGamepadReg.AvailableButtons))
    const pressedRegister = service.register(ArcadeGamepadReg.Buttons);
    const [pressed] = useRegisterUnpackedValue<[[ArcadeGamepadButton, number][]]>(pressedRegister);
    const host = useServiceHost<ArcadeGamepadServiceHost>(service);
    const color = host ? "secondary" : "primary";
    const { background } = useWidgetTheme(color);

    if (!available?.length)
        return <LoadingProgress />

    const w = 256
    const h = 128

    const cw = w / 12
    const ch = h / 4

    const ro = cw - 2
    const ri = ro - 4

    const sro = ro - 10
    const sri = sro - 2
    const scy = sro

    const pos = {
        [ArcadeGamepadButton.Left]: { cx: cw * 1.5, cy: 2 * ch, small: false },
        [ArcadeGamepadButton.Up]: { cx: cw * 3, cy: ch, small: false },
        [ArcadeGamepadButton.Right]: { cx: cw * 4.5, cy: 2 * ch, small: false },
        [ArcadeGamepadButton.Down]: { cx: cw * 3, cy: 3 * ch, small: false },

        [ArcadeGamepadButton.A]: { cx: cw * 10.5, cy: ch * 1.25, small: false },
        [ArcadeGamepadButton.B]: { cx: cw * 9.5, cy: ch * 2.75, small: false },

        [ArcadeGamepadButton.Menu]: { cx: cw * 7, cy: scy, small: true },
        [ArcadeGamepadButton.Select]: { cx: cw * 6, cy: scy, small: true },

        [ArcadeGamepadButton.Exit]: { cx: cw * 8, cy: scy, small: true },
        [ArcadeGamepadButton.Reset]: { cx: cw * 9, cy: scy, small: true },
    }

    const handleRefresh = async () => await pressedRegister.refresh();

    const abx = cw * 8 + 1
    const aby = ch * 3 + 4
    const abr = cw / 2;
    const abw = cw * 5 - 6;
    return <SvgWidget width={w} height={h}>
        <circle cx={cw * 3} cy={2 * ch} r={2.6 * cw} fill="none" stroke={background} strokeWidth={4} />
        <rect transform={`rotate(-66, ${abx}, ${aby})`} x={abx} y={aby} rx={abr} ry={abr} width={abw} height={cw * 2.2} fill="none" stroke={background} strokeWidth={4} />
        {available.map(button => ({ button: button[0], pos: pos[button[0]] }))
            .map(({ button, pos }) => <ArcadeButton
                key={button}
                cx={pos.cx}
                cy={pos.cy}
                ro={pos.small ? sro : ro}
                ri={pos.small ? sri : ri}
                button={button}
                host={host}
                onRefresh={handleRefresh}
                pressure={pressed?.find(p => p[0] === button)?.[1] || 0}
                color={color}
            />)}
    </SvgWidget>
}