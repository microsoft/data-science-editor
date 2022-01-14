import React, { lazy } from "react"
import { ColorReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"
import Suspense from "../ui/Suspense"
const ColorInput = lazy(() => import("../ui/ColorInput"))

export default function DashboardColor(props: DashboardServiceProps) {
    const { service } = props
    const register = useRegister(service, ColorReg.Color)
    const [r, g, b] = useRegisterUnpackedValue<[number, number, number]>(
        register,
        props
    )
    const server =
        useServiceServer<SensorServer<[number, number, number]>>(service)
    const color = server ? "secondary" : "primary"
    const { background } = useWidgetTheme(color)

    if (r === undefined) return <LoadingProgress />

    const value = `rgb(${(r * 0xff) | 0}, ${(g * 0xff) | 0}, ${(b * 0xff) | 0})`
    const handleChange = (color: string) => {
        const hex = color.replace(/^#/, "")
        const rgb = parseInt(hex, 16)
        const r = (rgb >> 16) & 0xff
        const g = (rgb >> 8) & 0xff
        const b = (rgb | 0) & 0xff
        server.reading.setValues([r / 0xff, g / 0xff, b / 0xff])
        register.refresh()
    }
    const w = 64
    const rx = 4

    if (server)
        return (
            <Suspense>
                <ColorInput value={value} onChange={handleChange} />
            </Suspense>
        )
    else
        return (
            <SvgWidget width={w} height={w}>
                <rect
                    x={0}
                    y={0}
                    width={w}
                    height={w}
                    rx={rx}
                    ry={rx}
                    fill={value}
                    stroke={background}
                    strokeWidth={2}
                    tabIndex={0}
                    aria-label={`color ${value} detected`}
                />
            </SvgWidget>
        )
}
