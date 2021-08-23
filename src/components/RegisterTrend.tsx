import React, { useCallback, useContext, useEffect, useMemo } from "react"
import { REPORT_RECEIVE } from "../../jacdac-ts/src/jdom/constants"
import JDRegister from "../../jacdac-ts/src/jdom/register"
import JacdacContext, { JacdacContextProps } from "../jacdac/Context"
import FieldDataSet from "./FieldDataSet"
import Trend from "./Trend"
import useChartPalette from "./useChartPalette"
import useChange from "../jacdac/useChange"
import useInterval from "./hooks/useInterval"

const DEFAULT_HORIZON = 50
const DEFAULT_HEIGHT = 12

export default function RegisterTrend(props: {
    register: JDRegister
    showName?: boolean
    horizon?: number
    height?: number
    mini?: boolean
    interval?: number
}) {
    const { register, mini, horizon, height, interval } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const palette = useChartPalette()
    const dataSet = useMemo(
        () => FieldDataSet.create(bus, [register], "output", palette, 100),
        [register, palette]
    )
    useChange(dataSet)
    const addRow = () => dataSet.addRow()
    // register on change if no intervals
    useEffect(
        () =>
            interval ? undefined : register?.subscribe(REPORT_RECEIVE, addRow),
        [interval, register, dataSet]
    )
    useInterval(!!interval, addRow, interval, [dataSet])

    return (
        <Trend
            dataSet={dataSet}
            horizon={horizon || DEFAULT_HORIZON}
            gradient={true}
            height={height || DEFAULT_HEIGHT}
            mini={mini}
        />
    )
}
