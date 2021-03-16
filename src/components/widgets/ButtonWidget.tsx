import React from "react"
import SvgWidget from "./SvgWidget"
import useWidgetTheme from "./useWidgetTheme"
import useSvgButtonProps from "../hooks/useSvgButtonProps"

export default function ButtonWidget(props: {
    checked?: boolean
    label?: string
    color?: "primary" | "secondary"
    size?: string
    onDown?: () => void
    onUp?: () => void
}) {
    const { checked, label, color, size, onDown, onUp } = props
    const { background, controlBackground, active } = useWidgetTheme(color)

    const buttonProps = useSvgButtonProps<SVGCircleElement>(label, onDown, onUp)
    const w = 64
    const mo = checked ? 3 : 5
    const r = w / 2
    const cx = r
    const cy = r
    const ri = r - mo
    const rn = 8
    return (
        <SvgWidget width={w} size={size}>
            <rect
                x={0}
                y={0}
                rx={2}
                ry={2}
                width={w}
                height={w}
                fill={background}
            />
            <circle cx={rn} cy={rn} r={rn >> 1} fill={controlBackground} />
            <circle cx={w - rn} cy={rn} r={rn >> 1} fill={controlBackground} />
            <circle
                cx={w - rn}
                cy={w - rn}
                r={rn >> 1}
                fill={controlBackground}
            />
            <circle cx={rn} cy={w - rn} r={rn >> 1} fill={controlBackground} />
            <circle
                cx={cx}
                cy={cy}
                r={ri}
                aria-live="polite"
                fill={checked ? active : controlBackground}
                {...buttonProps}
            />
        </SvgWidget>
    )
}
