import React, { useCallback, useContext, useState } from "react"
import { styled } from "@mui/material/styles"
import { useTheme } from "@mui/material"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"

const PREFIX = "TrendChart"

const classes = {
    mini: `${PREFIX}mini`,
}

const Root = styled("div")(() => ({
    [`& .${classes.mini}`]: {
        display: "inline-block",
        width: "10rem",
    },
}))

export function useTrendChartData(maxLength = 25) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [trendData, setTrendData] = useState<[number, number][]>([])

    const addTrendValue = useCallback((value: number) => {
        if (isNaN(value)) return

        const { timestamp } = bus
        const entry: [number, number] = [timestamp, value]
        setTrendData(trendData => [...trendData.slice(-(maxLength - 1)), entry])
    }, [])

    return {
        trendData,
        addTrendValue,
    }
}

export default function TrendChart(props: {
    data: [number, number][]
    useGradient?: boolean
    unit?: string
    width?: number
    height?: number
    dot?: number
    mini?: boolean
}) {
    const {
        useGradient,
        data,
        unit,
        width = 80,
        height = 15,
        dot,
        mini,
    } = props

    const theme = useTheme()

    // nothing to show for
    if (data?.length < 2) return null

    const vpw = width
    const vph = height

    const color = theme.palette.secondary.main
    const shape = unit === "#" ? "step" : "line"
    const symmetric = unit === "g" ? true : false

    const values = data.map(r => r[1])
    const mint = data[0][0]
    const maxt = data[data.length - 1][0]
    let minv = unit === "/" ? 0 : Math.min.apply(null, values)
    let maxv = unit === "/" ? 1 : Math.max.apply(null, values)
    const opposite = unit !== "/" && Math.sign(minv) != Math.sign(maxv)
    if (isNaN(minv) && isNaN(maxv)) {
        minv = 0
        maxv = 1
    }
    if (symmetric) {
        maxv = Math.max(Math.abs(minv), Math.abs(maxv))
        minv = -maxv
    }
    const rv = maxv - minv

    const margin = 2
    const h = maxv - minv || 10
    const w = maxt - mint || 10

    const strokeWidth = 0.25
    const axisWidth = 0.2
    const axisColor = "#ccc"
    const pointRadius = strokeWidth * 1.5
    const toffset = -pointRadius * 3

    const x = (t: number) => ((t - mint) / w) * vpw
    const y = (v: number) => {
        if (v === undefined || isNaN(v)) v = minv
        // adding random for lineragradient bug workaround
        // which does not render perfectly
        // horizontal lines
        return (
            ((Math.random() * 0.0001 * rv - (v - minv)) / h) *
            (vph - 2 * margin)
        )
    }
    const lastRow = data[data.length - 1]
    const path =
        shape == "step"
            ? data
                  .map((row, ri) =>
                      ri == 0
                          ? `M ${x(row[0])} ${y(row[1])}`
                          : `H ${x(row[0])} V ${y(row[1])}`
                  )
                  .join(" ")
            : data
                  .map(
                      (row, ri) =>
                          `${ri == 0 ? `M` : `L`} ${x(row[0])} ${y(row[1])}`
                  )
                  .join(" ")
    return (
        <Root className={mini ? classes.mini : undefined}>
            <svg
                viewBox={`0 0 ${vpw} ${vph}`}
                style={{ maxHeight: mini ? "5vh" : "10vh", maxWidth: "100%" }}
            >
                {useGradient && (
                    <defs>
                        <linearGradient
                            key={`gradaxis`}
                            id={`gradientaxis`}
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop
                                offset="0%"
                                stopOpacity="0"
                                stopColor={axisColor}
                            />
                            <stop
                                offset="5%"
                                stopOpacity="0"
                                stopColor={axisColor}
                            />
                            <stop
                                offset="40%"
                                stopOpacity="1"
                                stopColor={axisColor}
                            />
                            <stop
                                offset="100%"
                                stopOpacity="1"
                                stopColor={axisColor}
                            />
                        </linearGradient>
                        {useGradient && (
                            <linearGradient
                                id={`gradient0`}
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop
                                    offset="0%"
                                    stopOpacity="0"
                                    stopColor={color}
                                />
                                <stop
                                    offset="5%"
                                    stopOpacity="0"
                                    stopColor={color}
                                />
                                <stop
                                    offset="40%"
                                    stopOpacity="1"
                                    stopColor={color}
                                />
                                <stop
                                    offset="100%"
                                    stopOpacity="1"
                                    stopColor={color}
                                />
                            </linearGradient>
                        )}
                    </defs>
                )}
                <g transform={`translate(${toffset}, ${vph - margin})`}>
                    {opposite && (
                        <line
                            x1={x(mint)}
                            x2={x(maxt)}
                            y1={y(0)}
                            y2={y(0)}
                            strokeWidth={axisWidth}
                            stroke={
                                useGradient ? `url(#gradientaxis)` : axisColor
                            }
                        />
                    )}
                    <g>
                        <path
                            d={path}
                            fill="none"
                            stroke={useGradient ? `url(#gradient0)` : color}
                            strokeWidth={strokeWidth}
                            strokeLinejoin="round"
                        />
                        {dot && (
                            <circle
                                cx={x(lastRow[0])}
                                cy={y(lastRow[1])}
                                r={pointRadius}
                                fill={color}
                            />
                        )}
                    </g>
                </g>
            </svg>
        </Root>
    )
}
