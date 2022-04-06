import React from "react"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import PowerButton from "./PowerButton"

export default function ServoWidget(props: {
    angle: number
    offset: number
    color: "primary" | "secondary"
    enabled?: boolean
    toggleOff?: () => void
    widgetSize?: string
}) {
    const { widgetSize, toggleOff, angle, offset, color, enabled } = props
    const { background, controlBackground, active, textPrimary, textProps } =
        useWidgetTheme(color)

    const cx = 78
    const cy = 55

    const a = enabled ? angle + (offset || 0) : 0
    const transform = `rotate(${-a}, ${cx}, ${cy})`
    const h = 111.406
    const w = 158.50195
    const pr = 14
    const pri = 6
    const text = enabled ? `${Math.round(a)}°` : "off"

    return (
        <SvgWidget
            title={`servo at angle ${angle}`}
            width={w}
            height={h}
            size={widgetSize}
        >
            <rect
                fill={background}
                x={0}
                y={10.687}
                width={158.62}
                height={89.75}
                rx={4}
                ry={4}
            />
            <path
                fill={controlBackground}
                d="M125.545 55.641c0-24.994-20.26-45.256-45.254-45.256-17.882.016-34.077 9.446-41.328 25.79-2.655.024-4.192.076-6.35.07-11.158 0-20.204 9.046-20.204 20.204 0 11.158 9.046 20.203 20.203 20.203 2.389-.005 4.354-.332 6.997-.256 7.56 15.59 23.356 24.485 40.682 24.5 24.992 0 45.254-20.264 45.254-45.256z"
            />
            <path
                fill={enabled ? active : background}
                stroke={active}
                transform={transform}
                d="M93.782 55.623c-.032-3.809-.19-6.403-.352-7.023h-.002c-.93-3.558-6.621-6.73-14.793-6.73-8.17 0-14.649 3.016-14.795 6.73-.25 6.419-4.049 62.795 13.561 62.806 14.308.008 16.52-39.277 16.38-55.783zm-8.05.08a7.178 7.178 0 010 .012 7.178 7.178 0 01-7.179 7.176 7.178 7.178 0 01-7.177-7.176 7.178 7.178 0 017.177-7.178 7.178 7.178 0 017.178 7.166z"
            />
            <text
                {...textProps}
                x={w / 2}
                y={30}
                textAnchor="middle"
                fill={textPrimary}
            >
                {text}
            </text>
            {toggleOff && (
                <PowerButton
                    r={pr}
                    ri={pri}
                    cx={w - pr - 4}
                    cy={pr + 14}
                    color={color}
                    strokeWidth={1.5}
                    off={!enabled}
                    onClick={toggleOff}
                />
            )}
        </SvgWidget>
    )
}
