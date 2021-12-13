import React, { useCallback, useContext, useEffect, useMemo } from "react"
import { REPORT_RECEIVE } from "../../jacdac-ts/src/jdom/constants"
import JDRegister from "../../jacdac-ts/src/jdom/register"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import FieldDataSet from "./FieldDataSet"
import Trend from "./Trend"
import useChartPalette from "./useChartPalette"
import useInterval from "./hooks/useInterval"

const DEFAULT_HORIZON = 255
const DEFAULT_HEIGHT = 12

export default function RegisterTrend(props: {
    register: JDRegister
    showName?: boolean
    horizon?: number
    height?: number
    mini?: boolean
    interval?: number
}) {
    const {
        register,
        mini,
        horizon = DEFAULT_HORIZON,
        height,
        interval,
    } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const palette = useChartPalette()
    const dataSet = useMemo(
        () =>
            FieldDataSet.create(
                bus,
                [register],
                "output",
                palette,
                horizon * 1.2
            ),
        [register, palette]
    )
    const addRow = useCallback(() => dataSet.addRow(), [dataSet])
    // register on change if no intervals
    useEffect(
        () =>
            interval ? undefined : register?.subscribe(REPORT_RECEIVE, addRow),
        [interval, register, addRow]
    )
    useInterval(!!interval, addRow, interval)

    return (
        <Trend
            dataSet={dataSet}
            horizon={horizon}
            gradient={true}
            height={height || DEFAULT_HEIGHT}
            mini={mini}
            yAxis={true}
        />
    )
}
