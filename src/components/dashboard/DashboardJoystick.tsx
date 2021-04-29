import React, { useMemo } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import useServiceServer from "../hooks/useServiceServer"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import JoystickServer, {
    JOYSTICK_GAMEPAD_EXTRA_BUTTONS,
} from "../../../jacdac-ts/src/servers/joystickserver"
import JoystickWidget from "../widgets/JoystickWidget"
import {
    JoystickButtons,
    JoystickReg,
    JoystickVariant,
} from "../../../jacdac-ts/src/jdom/constants"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useSvgButtonProps from "../hooks/useSvgButtonProps"
import LoadingProgress from "../ui/LoadingProgress"

function Thumb(props: DashboardServiceProps) {
    const { service } = props
    const register = service.register(JoystickReg.Direction)
    const [buttons, x, y] = useRegisterUnpackedValue<
        [JoystickButtons, number, number]
    >(register, props)
    const server = useServiceServer<JoystickServer>(service)
    const color = server ? "secondary" : "primary"

    const values = () => server.reading.values()
    const onUpdate = (buttons: JoystickButtons, newx: number, newy: number) => {
        server.reading.setValues([buttons, newx, newy])
        register.refresh()
    }

    return (
        <JoystickWidget
            x={x}
            y={y}
            buttons={buttons}
            color={color}
            onUpdate={onUpdate}
            hostValues={server && values}
        />
    )
}

const buttonLabels = {
    [JoystickButtons.Left]: "\u25C4",
    [JoystickButtons.Up]: "\u25B2",
    [JoystickButtons.Down]: "\u25BC",
    [JoystickButtons.Right]: "\u25BA",
}

function ArcadeButton(props: {
    cx: number
    cy: number
    ro: number
    ri: number
    pressure: number
    button: JoystickButtons
    server: JoystickServer
    onRefresh: () => void
    color?: "primary" | "secondary"
}) {
    const { cx, cy, ro, color, pressure, ri, button, server, onRefresh } = props
    const { textProps, active, background, controlBackground } = useWidgetTheme(
        color
    )
    const checked = (pressure || 0) > 0
    const title = JoystickButtons[button]
    const label = buttonLabels[button] || title[0]

    const handleDown = () => {
        server?.down(button) //, 0.7)
        onRefresh()
    }
    const handleUp = () => {
        server?.up(button)
        onRefresh()
    }
    const buttonProps = useSvgButtonProps<SVGCircleElement>(
        title,
        handleDown,
        handleUp
    )

    return (
        <g
            transform={`translate(${cx},${cy})`}
            aria-label={`button ${title} ${checked ? "down" : "up"}`}
        >
            <circle cx={0} cy={0} r={ro} fill={background} />
            <circle
                cx={0}
                cy={0}
                r={ri}
                fill={checked ? active : controlBackground}
                {...buttonProps}
            >
                <title>{title}</title>
            </circle>
            <text cx={0} cy={0} fontSize={ri} {...textProps}>
                {label}
            </text>
        </g>
    )
}

function Gamepad(props: DashboardServiceProps) {
    const { service } = props
    const [buttonsAvailable] = useRegisterUnpackedValue<[JoystickButtons]>(
        service.register(JoystickReg.ButtonsAvailable),
        props
    )
    const directionRegister = service.register(JoystickReg.Direction)
    const [buttons, x, y] = useRegisterUnpackedValue<
        [JoystickButtons, number, number]
    >(directionRegister, props)
    const server = useServiceServer<JoystickServer>(service)
    const color = server ? "secondary" : "primary"
    const { background } = useWidgetTheme(color)

    // buttonsAvailable should be defined by now

    const w = 256
    const h = 128

    const cw = w / 12
    const ch = h / 4

    const ro = cw - 2
    const ri = ro - 4

    const sro = ro - 10
    const sri = sro - 2
    const scy = sro

    const pos = useMemo(
        () =>
            [
                {
                    id: JoystickButtons.Left,
                    cx: cw * 1.5,
                    cy: 2 * ch,
                    small: false,
                },
                { id: JoystickButtons.Up, cx: cw * 3, cy: ch, small: false },
                {
                    id: JoystickButtons.Right,
                    cx: cw * 4.5,
                    cy: 2 * ch,
                    small: false,
                },
                {
                    id: JoystickButtons.Down,
                    cx: cw * 3,
                    cy: 3 * ch,
                    small: false,
                },
                {
                    id: JoystickButtons.A,
                    cx: cw * 10.5,
                    cy: ch * 1.25,
                    small: false,
                },
                {
                    id: JoystickButtons.B,
                    cx: cw * 9.5,
                    cy: ch * 2.75,
                    small: false,
                },
                { id: JoystickButtons.Menu, cx: cw * 7, cy: scy, small: true },
                {
                    id: JoystickButtons.Select,
                    cx: cw * 6,
                    cy: scy,
                    small: true,
                },

                { id: JoystickButtons.Exit, cx: cw * 8, cy: scy, small: true },
                { id: JoystickButtons.Reset, cx: cw * 9, cy: scy, small: true },
            ].filter(p => !!(p.id & buttonsAvailable)),
        [buttonsAvailable]
    )

    const handleRefresh = async () => await directionRegister.refresh()

    const abx = cw * 8 + 1
    const aby = ch * 3 + 4
    const abr = cw / 2
    const abw = cw * 5 - 6
    return (
        <SvgWidget width={w} height={h}>
            <circle
                cx={cw * 3}
                cy={2 * ch}
                r={2.6 * cw}
                fill="none"
                stroke={background}
                strokeWidth={4}
            />
            <rect
                transform={`rotate(-66, ${abx}, ${aby})`}
                x={abx}
                y={aby}
                rx={abr}
                ry={abr}
                width={abw}
                height={cw * 2.2}
                fill="none"
                stroke={background}
                strokeWidth={4}
            />
            {pos.map(({ id, cx, cy, small }) => (
                <ArcadeButton
                    key={id}
                    cx={cx}
                    cy={cy}
                    ro={small ? sro : ro}
                    ri={small ? sri : ri}
                    button={id}
                    server={server}
                    onRefresh={handleRefresh}
                    pressure={buttons & id ? 1 : 0}
                    color={color}
                />
            ))}
        </SvgWidget>
    )
}

export default function DashboardJoystick(props: DashboardServiceProps) {
    const { service } = props
    let [variant] = useRegisterUnpackedValue<[JoystickVariant]>(
        service.register(JoystickReg.Variant),
        props
    )
    const [buttonsAvailable] = useRegisterUnpackedValue<[JoystickButtons]>(
        service.register(JoystickReg.ButtonsAvailable),
        props
    )

    // need button info
    if (buttonsAvailable === undefined) return <LoadingProgress />

    // if variant is not specific, infer from buttons
    if (variant === undefined) {
        if (buttonsAvailable & JOYSTICK_GAMEPAD_EXTRA_BUTTONS)
            variant = JoystickVariant.Gamepad
        else if (!buttonsAvailable || buttonsAvailable === JoystickButtons.A)
            variant = JoystickVariant.Thumb
    }

    // render in 2 modes
    return variant == JoystickVariant.Thumb ? (
        <Thumb {...props} />
    ) : (
        <Gamepad {...props} />
    )
}
