import { Grid, Typography } from "@mui/material"
import React, { useEffect, useState } from "react"
import { PlanarPositionReg } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { SensorServer } from "../../../jacdac-ts/src/servers/sensorserver"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import useServiceServer from "../hooks/useServiceServer"
import SvgWidget from "../widgets/SvgWidget"
import useWidgetTheme from "../widgets/useWidgetTheme"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"
import { DashboardServiceProps } from "./DashboardServiceWidget"

const HORIZON = 10

export default function DashboardButton(props: DashboardServiceProps) {
    const { service } = props

    const positionRegister = useRegister(service, PlanarPositionReg.Position)
    const [x, y] = useRegisterUnpackedValue<[number, number]>(
        positionRegister,
        props
    )
    const [points, setPoints] = useState<number[][]>([])
    const server = useServiceServer<SensorServer<[number, number]>>(service)
    const color = server ? "secondary" : "primary"
    const { controlBackground, active } = useWidgetTheme(color)

    useEffect(() => setPoints([]), [positionRegister]) // clear points on new register
    useEffect(
        () =>
            setPoints(pts =>
                x === undefined ? [] : [...pts, [x, y]].slice(-HORIZON)
            ),
        [x, y]
    ) // append new points

    if (x === undefined || y === undefined)
        return <DashboardRegisterValueFallback register={positionRegister} />

    const n = points.length
    const [x0, y0] = points[0] || [0, 0]
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
    const width = max[0] - min[0]
    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SvgWidget width={width} size="10rem">
                    <g transform={`translate(${-x0}, -${y0})`}>
                        <rect
                            fill={controlBackground}
                            rx={2}
                            x={min[0]}
                            width={width}
                        />
                        <path
                            d={`${points
                                .map(p => `l ${p[0]} ${p[1]}`)
                                .join(" ")}`}
                            stroke={active}
                            strokeWidth="2"
                            fill="none"
                        />
                        <circle cx={xn} cy={yn} r="4" fill={active} />
                    </g>
                </SvgWidget>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="subtitle1">
                    {x}mm, {y}mm
                </Typography>
            </Grid>
        </Grid>
    )
}
