/* eslint-disable @typescript-eslint/no-explicit-any */
import { Grid } from "@mui/material"
import React, { lazy, useId, useState } from "react"
import SliderWithLabel from "../../components/ui/SliderWithLabel"
import Suspense from "../../components/ui/Suspense"
const EC30 = lazy(() => import("../../components/ec30/EC30"))

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

    return (
        <>
            <h1>EC30 profile</h1>
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
                        <EC30 gw={gridWidth} gh={gridHeight} />
                    </Suspense>
                </Grid>
            </Grid>
        </>
    )
}
