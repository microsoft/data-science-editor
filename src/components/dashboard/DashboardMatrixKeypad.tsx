import React, { SVGProps, useRef } from "react"
import { MatrixKeypadReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import useFireKey from "../hooks/useFireKey"
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps"
import MatrixKeypadServer from "../../../jacdac-ts/src/servers/matrixkeypadserver"
import LoadingProgress from "../ui/LoadingProgress"
import useWidgetSize from "../widgets/useWidgetSize"

export default function DashboardMatrixKeypad(props: DashboardServiceProps) {
    const { service, services, variant } = props

    const widgetRef = useRef<SVGGElement>()
    const pressedRegister = service.register(MatrixKeypadReg.Pressed)
    const [pressed] = useRegisterUnpackedValue<[[number][]]>(
        pressedRegister,
        props
    )
    const [labels] = useRegisterUnpackedValue<[[string][]]>(
        service.register(MatrixKeypadReg.Labels),
        props
    )
    const [rows] = useRegisterUnpackedValue<[number]>(
        service.register(MatrixKeypadReg.Rows),
        props
    )
    const [columns] = useRegisterUnpackedValue<[number]>(
        service.register(MatrixKeypadReg.Columns),
        props
    )
    const host = useServiceServer<MatrixKeypadServer>(service)
    const color = host ? "secondary" : "primary"
    const { background, controlBackground, active, textProps } = useWidgetTheme(
        color
    )
    const widgetSize = useWidgetSize(variant, services.length)

    // no data about layout
    if (rows === undefined || columns === undefined) return <LoadingProgress />

    const clickeable = !!host
    // compute size
    const pw = 8
    const ph = 8
    const ps = 0.5
    const pr = 1
    const m = 2
    const w = columns * pw + (columns + 1) * m
    const h = rows * ph + (rows + 1) * m

    const handleButtonUp = (index: number) => () => {
        host.up(index)
        pressedRegister.refresh()
    }
    const handleButtonDown = (index: number) => () => {
        host.down(index)
        pressedRegister.refresh()
    }

    // add leds
    const render = () => {
        const ledEls: JSX.Element[] = []
        const ledProps: SVGProps<SVGRectElement> = {
            className: clickeable ? "clickeable" : undefined,
            role: clickeable ? "button" : "",
            tabIndex: clickeable ? 0 : undefined,
        }

        let y = m
        for (let row = 0; row < rows; row++) {
            let x = m
            for (let col = 0; col < columns; col++) {
                const index = row * columns + col
                const on = pressed?.findIndex(p => p[0] === index) > -1
                const label = labels?.[index]?.[0]

                const handleUp = clickeable ? handleButtonUp(index) : undefined
                const handleDown = clickeable
                    ? handleButtonDown(index)
                    : undefined
                const fireUp = useFireKey(handleUp)
                const fireDown = useFireKey(handleDown)

                ledEls.push(
                    <rect
                        key={`l${row}-${col}`}
                        x={x}
                        y={y}
                        width={pw}
                        height={ph}
                        rx={pr}
                        ry={pr}
                        fill={on ? active : controlBackground}
                        stroke={"none"}
                        strokeWidth={ps}
                        {...ledProps}
                        aria-label={label || `key ${row},${col}`}
                        onKeyDown={fireDown}
                        onKeyUp={fireUp}
                        onPointerDown={handleDown}
                        onPointerUp={handleUp}
                    />
                )
                if (label) {
                    ledEls.push(
                        <text
                            key={`t${row}-${col}`}
                            fontSize={(ph * 2) / 3}
                            {...textProps}
                            x={x + pw / 2}
                            y={y + ph / 2}
                        >
                            {label}
                        </text>
                    )
                }
                x += pw + m
            }
            y += ph + m
        }
        return { ledEls }
    }

    const { ledEls } = render()
    const navProps = useKeyboardNavigationProps(widgetRef.current)
    return (
        <SvgWidget width={w} height={h} size={widgetSize}>
            <rect
                x={0}
                y={0}
                width={w}
                height={h}
                rx={pr}
                ry={pr}
                fill={background}
            />
            <g ref={widgetRef} {...navProps}>
                {ledEls}
            </g>
        </SvgWidget>
    )
}
