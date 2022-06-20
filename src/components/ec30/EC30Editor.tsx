/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material"
import React, { lazy, useId, useState } from "react"
import { generateEC30EnclosureModel } from "../enclosure/ec30"
import SliderWithLabel from "../ui/SliderWithLabel"
import Suspense from "../ui/Suspense"
const EC30Card = lazy(() => import("./EC30Card"))

export default function EC30Editor() {
    const [gridWidth, setGridWith] = useState(2)
    const [gridHeight, setGridHeight] = useState(2)
    const [connectors, setConnectors] = useState({
        l: 1,
        r: 1,
    })
    const id = useId()
    const gridHeightId = id + "-height"
    const gridWidthId = id + "-width"
    const lconnectorId = id + "-l-connectors"
    const rconnectorId = id + "-r-connectors"

    const handleGridWidth: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridWith(value as number)
    const handleGridHeight: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => {
        const v = value as number
        setGridHeight(v)
        setConnectors({
            l: Math.min(connectors.l, v - 1),
            r: Math.min(connectors.r, v - 1),
        })
    }
    const handleLeftConnector: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setConnectors({ ...connectors, l: value as number })
    const handleRightConnector: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setConnectors({ ...connectors, r: value as number })

    const c = Object.entries(connectors)
        .map(([key, value]) =>
            value > 0 ? `${key}${value > 1 ? value : ""}` : ""
        )
        .join("")
    const model = generateEC30EnclosureModel(gridWidth, gridHeight, c, 1.6)
    return (
        <Grid container spacing={2}>
            <Grid item>
                <SliderWithLabel
                    id={gridWidthId}
                    label={`grid width: ${gridWidth * 10}mm`}
                    value={gridWidth}
                    onChange={handleGridWidth}
                    min={1}
                    max={12}
                />
            </Grid>
            <Grid item>
                <SliderWithLabel
                    id={gridHeightId}
                    label={`grid height: ${gridHeight * 10}mm`}
                    value={gridHeight}
                    onChange={handleGridHeight}
                    min={2}
                    max={12}
                />
            </Grid>
            <Grid item>
                <SliderWithLabel
                    id={lconnectorId}
                    label={`left connectors: ${connectors.l || 0}`}
                    value={connectors.l}
                    onChange={handleLeftConnector}
                    min={1}
                    max={gridHeight - 1}
                />
            </Grid>
            <Grid item>
                <SliderWithLabel
                    id={rconnectorId}
                    label={`right connectors: ${connectors.r || 0}`}
                    value={connectors.r}
                    onChange={handleRightConnector}
                    min={0}
                    max={gridHeight - 1}
                />
            </Grid>
            <Grid item xs={12}>
                <Suspense>
                    <EC30Card model={model} showSave={true} />
                </Suspense>
            </Grid>
        </Grid>
    )
}
