import { useMemo } from "react"
import { exporter, IModel } from "makerjs"
import { useTheme } from "@mui/material"

export function useModelSvg(m: IModel) {
    const theme = useTheme()
    return useMemo(
        () =>
            m &&
            (exporter.toSVG(m, {
                units: "mm",
                strokeWidth: "2",
                stroke: theme.palette.common.black,
                fill: theme.palette.background.paper,
            }) as string),
        [theme, m]
    )
}

export function useModelDXF(m: IModel) {
    return useMemo(
        () =>
            m &&
            (exporter.toDXF(m, {
                units: "mm",
            }) as string),
        [m]
    )
}
