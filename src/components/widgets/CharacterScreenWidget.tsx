import React from "react"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"

export default function CharacterScreenWidget(props: {
    rows: number
    columns: number
    message: string
    rtl?: boolean
    disabled?: boolean
}) {
    const { rows, columns, message, rtl, disabled } = props
    const { textPrimary, background, controlBackground } =
        useWidgetTheme("primary")
    const cw = 8
    const ch = 10
    const m = 1
    const mo = 2
    const fs = 8

    const w = columns * (cw + m) - m + 2 * mo
    const h = rows * (ch + m) - m + 2 * mo

    const lines = (message || "").split(/\n/g)
    const els: JSX.Element[] = []

    let y = mo
    for (let row = 0; row < rows; ++row) {
        let x = mo
        const line = lines[row]
        for (let column = 0; column < columns; ++column) {
            const char = line?.[rtl ? columns - 1 - column : column]
            els.push(
                <g key={`${row}-${column}`}>
                    <rect
                        x={x}
                        y={y}
                        width={cw}
                        height={ch}
                        fill={controlBackground}
                    />
                    {char && (
                        <text
                            x={x + cw / 2}
                            y={y + ch - fs / 3}
                            textAnchor="middle"
                            fontSize={fs}
                            style={{
                                fontFamily: "monospace",
                                fontWeight: 100,
                            }}
                            fill={disabled ? background : textPrimary}
                            aria-label={char}
                        >
                            {char}
                        </text>
                    )}
                </g>
            )
            x += cw + m
        }

        y += ch + m
    }
    return (
        <SvgWidget
            tabIndex={0}
            title={`character screen displaying "${message}"`}
            width={w}
            height={h}
        >
            <>
                <rect
                    x={0}
                    y={0}
                    width={w}
                    height={h}
                    r={m / 2}
                    fill={background}
                />
                {els}
            </>
        </SvgWidget>
    )
}
