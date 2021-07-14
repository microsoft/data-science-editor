import { Grid } from "@material-ui/core"
import React, { ReactNode } from "react"

export default function CarouselGrid(props: { children: ReactNode }) {
    const { children } = props
    return (
        <Grid item>
            <Grid
                container
                justifyContent="center"
                direction="row"
                spacing={2}
                alignContent="center"
                alignItems="flex-start"
            >
                {children}
            </Grid>
        </Grid>
    )
}
