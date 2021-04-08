import React from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import useServiceServer from "../hooks/useServiceServer"
import useWidgetSize from "../widgets/useWidgetSize"
import useThrottledValue from "../hooks/useThrottledValue"
import useSvgButtonProps from "../hooks/useSvgButtonProps"
import ReflectedLightServer from "../../../jacdac-ts/src/servers/reflectedlightserver"
import {
    ReflectedLightReg,
    ReflectedLightVariant,
} from "../../../jacdac-ts/src/jdom/constants"

export default function DashboardReflectedLight(props: DashboardServiceProps) {
    const { service, services, variant } = props

    const brighessRegister = service.register(ReflectedLightReg.Brightness)
    const [brightness] = useRegisterUnpackedValue<[number]>(
        brighessRegister,
        props
    )
    const [sensorVariant] = useRegisterUnpackedValue<[ReflectedLightVariant]>(
        service.register(ReflectedLightReg.Variant),
        props
    )

    const server = useServiceServer<ReflectedLightServer>(service)
    const color = server ? "secondary" : "primary"
    const { background, controlBackground } = useWidgetTheme(color)
    const widgetSize = useWidgetSize(variant, services.length)

    const maxValue = 1.0
    const handleDown = () => {
        server.reading.setValues([brightness > 0 ? 0 : 1.0])
        brighessRegister.refresh()
    }
    const buttonProps = useSvgButtonProps<SVGRectElement>(
        "line detector",
        server && handleDown
    )

    const actualBrightness = useThrottledValue(brightness || 0, maxValue << 2)

    const w = 64
    const h = 64
    const m = 4
    const sw = sensorVariant === ReflectedLightVariant.InfraredAnalog ? 32 : 16
    const dx = w >> 1
    const x = (w - sw - dx) / 2 + (actualBrightness / maxValue) * dx
    const sh = 32
    const dark = "#000"
    const bright = "#ddd"

    return (
        <SvgWidget width={w} height={h} size={widgetSize}>
            <rect
                x={0}
                y={0}
                width={w >> 1}
                height={h}
                fill={dark}
                aria-label="dark area"
            />
            <rect
                x={w >> 1}
                y={0}
                width={w >> 1}
                height={h}
                fill={bright}
                aria-label="bright area"
            />
            <g transform={`translate(${x}, ${h - m - sh})`}>
                <rect
                    x={0}
                    y={0}
                    width={sw}
                    height={sh}
                    fill={background}
                    {...buttonProps}
                />
                <circle
                    cx={sw >> 1}
                    cy={sh / 3}
                    r={sw / 2 - 4}
                    fill={dark}
                    stroke={controlBackground}
                    strokeWidth={2}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                />
                <circle
                    cx={sw >> 1}
                    cy={(sh * 2) / 3}
                    r={sw / 2 - 4}
                    fill={bright}
                    stroke={controlBackground}
                    strokeWidth={2}
                    style={{ userSelect: "none", pointerEvents: "none" }}
                />
            </g>
        </SvgWidget>
    )
}
