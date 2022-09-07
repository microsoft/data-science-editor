import React, { PointerEvent, useEffect, useRef, useState } from "react"
import { PlanarPositionReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { PlanarPositionServer } from "../../../jacdac-ts/src/servers/planarpositionserver"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useServiceServer from "../hooks/useServiceServer"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"
import { DashboardServiceProps } from "./DashboardServiceWidget"

const HORIZON = 16

export default function DashboardButton(props: DashboardServiceProps) {
    const { service } = props
    const svgRef = useRef<SVGSVGElement>(undefined)
    const positionRegister = useRegister(service, PlanarPositionReg.Position)
    const [x, y] = useRegisterUnpackedValue<[number, number]>(
        positionRegister,
        props
    )
    const [points, setPoints] = useState<number[][]>([])
    const server = useServiceServer<PlanarPositionServer>(service)
    const color = server ? "secondary" : "primary"
    const { controlBackground, active, textProps } = useWidgetTheme(color)

    useEffect(() => setPoints([]), [positionRegister]) // clear points on new register
    useEffect(
        () =>
            setPoints(pts =>
                x === undefined ? [] : [...pts, [x, y]].slice(-HORIZON)
            ),
        [x, y]
    ) // append new points

    const n = points.length
    const [xn, yn] = points[n - 1] || [0, 0]
    const min = points.reduce(
        (prev, curr) => [
            Math.min(prev[0], curr[0]),
            Math.min(prev[1], curr[1]),
        ],
        [0, 0]
    )
    const max = points.reduce(
        (prev, curr) => [
            Math.min(prev[0], curr[0]),
            Math.min(prev[1], curr[1]),
        ],
        [0, 0]
    )
    const width = Math.max(64, max[0] - min[0])

    const handlePointerMove = (ev: PointerEvent<SVGRectElement>) => {
        const svg = svgRef.current
        const pt = svg.createSVGPoint()
        pt.x = ev.clientX
        pt.y = ev.clientY
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse())
        const [cx, cy] = server.reading.values()
        server.move(svgP.x - cx + (width >> 1), svgP.y - cy + (width >> 1))
    }

    if (x === undefined || y === undefined)
        return <DashboardRegisterValueFallback register={positionRegister} />

    const tvalue = `${Math.round(x)}mm, ${Math.round(y)}mm`
    return (
        <SvgWidget svgRef={svgRef} width={width} height={width} size="12rem">
            <rect
                fill={controlBackground}
                rx={2}
                x={0}
                y={0}
                width={width}
                height={width}
                onPointerMove={server ? handlePointerMove : undefined}
                style={{ cursor: server ? "pointer" : undefined }}
            />
            <g transform={`translate(${-width >> 1}, ${-width >> 1})`}>
                <path
                    d={`${points
                        .map((p, i) => `${i ? `L` : `M`} ${p[0]} ${p[1]}`)
                        .join(" ")}`}
                    stroke={active}
                    strokeWidth="2"
                    fill="none"
                />
                <circle cx={xn} cy={yn} r="4" fill={active} />
            </g>
            <text
                x={width >> 1}
                y={width >> 1}
                {...textProps}
                aria-label={tvalue}
                fontSize="0.4rem"
            >
                {tvalue}
            </text>
        </SvgWidget>
    )
}
