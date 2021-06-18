import React from "react"
import useSvgButtonProps from "../hooks/useSvgButtonProps"
import { describeArc } from "./svgutils"
import useWidgetTheme from "./useWidgetTheme"

export default function PowerButton(props: {
    cx: number
    cy: number
    r: number
    ri: number
    strokeWidth?: number
    label?: string
    color?: "primary" | "secondary"
    off?: boolean
    borderStroke?: string
    onClick?: () => void
}) {
    const {
        cx,
        cy,
        r,
        ri,
        onClick,
        off,
        color,
        label,
        strokeWidth,
        borderStroke,
    } = props
    const { background, active, controlBackground, textProps } =
        useWidgetTheme(color)
    const a = 135
    const d = describeArc(cx, cy, ri, -a, a, true)
    const btnlabel = off ? "turn on" : "turn off"
    const buttonProps = useSvgButtonProps<SVGCircleElement>(btnlabel, onClick)
    const sw = strokeWidth || 3
    const iconStroke = off ? background : active

    return (
        <g aria-label={label}>
            <title>{btnlabel}</title>
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={controlBackground}
                strokeWidth={sw}
                stroke={borderStroke || background}
                {...buttonProps}
            />
            <g transform={`rotate(180, ${cx}, ${cy})`}>
                <path
                    d={d}
                    strokeLinecap="round"
                    fill="none"
                    strokeWidth={sw}
                    stroke={iconStroke}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                />
                <line
                    strokeLinecap="round"
                    x1={cx}
                    y1={cy + ri / 4}
                    x2={cx}
                    y2={cy + ri}
                    stroke={iconStroke}
                    strokeWidth={sw}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                />
            </g>
            <text aria-label={label} x={cx} y={cy + r + 8} {...textProps} fontSize={"80%"}>
                {label}
            </text>
        </g>
    )
}
