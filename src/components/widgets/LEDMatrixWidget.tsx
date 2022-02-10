import React, { SVGProps, useEffect, useRef, useState } from "react"
import SvgWidget from "./SvgWidget"
import useWidgetTheme from "./useWidgetTheme"
import useFireKey from "../hooks/useFireKey"
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps"
import LoadingProgress from "../ui/LoadingProgress"
import { toggleBit } from "../../../jacdac-ts/src/jdom/utils"

export default function LEDMatrixWidget(props: {
    leds: Uint8Array
    brightness: number
    rows: number
    columns: number
    color?: "primary" | "secondary"
    onChange?: (newLeds: Uint8Array) => void
    dots?: boolean
}) {
    const {
        leds,
        brightness = 0.5,
        rows,
        columns,
        color = "primary",
        onChange,
        dots,
    } = props
    const [currentLeds, setCurrentLeds] = useState(leds)
    const widgetRef = useRef<SVGGElement>()
    const { background, controlBackground, active } = useWidgetTheme(color)
    const navProps = useKeyboardNavigationProps(widgetRef.current)

    // grad new leds value
    useEffect(() => setCurrentLeds(leds), [leds])

    // no data about layout
    if (rows === undefined || columns === undefined) return <LoadingProgress />

    const widgetSize = `clamp(5rem, 16vw, 16vh)`

    // compute size
    const minOpacity = 0.6
    const pw = 8
    const ph = 8
    const ps = 0.5
    const pr = dots ? 4 : 2
    const m = 2
    const w = columns * pw + (columns + 1) * m
    const h = rows * ph + (rows + 1) * m

    const columnspadded = columns + (8 - (columns % 8))

    const handleLedClick =
        (bitindex: number) => (ev: React.PointerEvent<SVGRectElement>) => {
            if (ev && !ev.buttons) return
            let newLeds = currentLeds.slice(0)
            // ensure that newLeds has the right size
            const n = rows * columnspadded
            if (newLeds.length !== n) {
                if (newLeds.length > n) newLeds = newLeds.slice(0, n)
                else {
                    const temp = new Uint8Array(n)
                    temp.set(newLeds, 0)
                    newLeds = temp
                }
            }
            toggleBit(newLeds, bitindex)
            setCurrentLeds(newLeds)
            onChange?.(newLeds)
        }

    // add leds
    const render = () => {
        const boxEls: JSX.Element[] = []
        const ledEls: JSX.Element[] = []
        const onFill = active
        const onStroke = undefined
        const offFill = controlBackground
        const offStroke = "transparent"
        const ledProps: SVGProps<SVGRectElement> = {
            className: "clickeable",
            role: "button",
            tabIndex: 0,
        }

        let y = m
        for (let row = 0; row < rows; row++) {
            let x = m
            for (let col = 0; col < columns; col++) {
                const box = (
                    <rect
                        key={`b${row}-${col}`}
                        x={x}
                        y={y}
                        width={pw}
                        height={ph}
                        rx={pr}
                        ry={pr}
                        fill={controlBackground}
                    />
                )
                boxEls.push(box)

                const bitindex = row * columnspadded + col
                const byte = currentLeds?.[bitindex >> 3]
                const bit = bitindex % 8
                const on = 1 === ((byte >> bit) & 1)
                const handleClick = handleLedClick(bitindex)
                const fireClick = useFireKey(handleClick)

                ledEls.push(
                    <rect
                        key={`l${row}-${col}`}
                        x={x}
                        y={y}
                        width={pw}
                        height={ph}
                        rx={pr}
                        ry={pr}
                        fill={on ? onFill : offFill}
                        stroke={on ? onStroke : offStroke}
                        strokeWidth={ps}
                        {...ledProps}
                        aria-label={`led ${row}, ${col} ${on ? "on" : "off"}`}
                        onPointerDown={handleClick}
                        onPointerEnter={handleClick}
                        onKeyDown={fireClick}
                    />
                )
                x += pw + m
            }
            y += ph + m
        }
        return { boxEls, ledEls }
    }

    const { boxEls, ledEls } = render()
    return (
        <SvgWidget size={widgetSize} width={w} height={h}>
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={2}
                ry={2}
                fill={background}
            />
            <g ref={widgetRef} {...navProps}>
                {boxEls}
                {ledEls.length && (
                    <g opacity={minOpacity + brightness * (1 - minOpacity)}>
                        {ledEls}
                    </g>
                )}
            </g>
        </SvgWidget>
    )
}
