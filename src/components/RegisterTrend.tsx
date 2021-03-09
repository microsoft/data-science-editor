import React, { useContext, useEffect, useRef } from "react";
import { REPORT_RECEIVE } from "../../jacdac-ts/src/jdom/constants";
import { JDRegister } from "../../jacdac-ts/src/jdom/register";
import JacdacContext, { JacdacContextProps } from "../jacdac/Context";
import FieldDataSet from "./FieldDataSet"
import Trend from "./Trend"
import useChartPalette from "./useChartPalette";
import useChange from "../jacdac/useChange"

const DEFAULT_HORIZON = 50
const DEFAULT_HEIGHT = 12

export default function RegisterTrend(props: {
    register: JDRegister,
    showName?: boolean,
    horizon?: number,
    height?: number,
    mini?: boolean,
    interval?: number,
}) {
    const { register, mini, horizon, height, interval } = props;
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const palette = useChartPalette()
    const dataSet = useRef(FieldDataSet.create(bus, [register], "output", palette, 100));

    useChange(dataSet.current);

    const addRow = () => dataSet.current.addRow();
    // register on change if no intervals
    useEffect(() => interval ? undefined : register?.subscribe(REPORT_RECEIVE, addRow), [interval, register])
    // keep logging
    useEffect(() => {
        const id = interval && setInterval(addRow, interval);
        return () => id && clearInterval(id);
    }, [interval])

    return <Trend dataSet={dataSet.current}
        horizon={horizon || DEFAULT_HORIZON}
        gradient={true}
        height={height || DEFAULT_HEIGHT} mini={mini} />
}