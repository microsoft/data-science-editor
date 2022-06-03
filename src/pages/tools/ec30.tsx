/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material"
import React, { lazy, useId, useState } from "react"
import { generateEC30EnclosureModel } from "../../components/enclosure/ec30"
import SliderWithLabel from "../../components/ui/SliderWithLabel"
import Suspense from "../../components/ui/Suspense"
const EC30Card = lazy(() => import("../../components/ec30/EC30Card"))

export default function Page() {
    const [gridWidth, setGridWith] = useState(2)
    const [gridHeight, setGridHeight] = useState(2)

    const id = useId()
    const gridHeightId = id + "-height"
    const gridWidthId = id + "-width"

    const handleGridWidth: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridWith(value as number)
    const handleGridHeight: any = (
        event: React.ChangeEvent<unknown>,
        value: number | number[]
    ) => setGridHeight(value as number)

    const model = generateEC30EnclosureModel(gridWidth, gridHeight, 1.6)

    return (
        <>
            <h1>EC30 shape generator</h1>
            <Grid container spacing={2}>
                <Grid item>
                    <SliderWithLabel
                        id={gridWidthId}
                        label={`grid width: ${gridWidth * 10}mm`}
                        value={gridWidth}
                        onChange={handleGridWidth}
                        min={2}
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
                <Grid item xs={12}>
                    <Suspense>
                        <EC30Card model={model} />
                    </Suspense>
                </Grid>
            </Grid>
        </>
    )
}
