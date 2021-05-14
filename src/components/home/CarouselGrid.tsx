import { Grid } from "@material-ui/core"
import React, { ReactNode } from "react"

export default function CarouselGrid(props: { children: ReactNode }) {
    const { children } = props
    return (
        <Grid item>
            <Grid
                container
                justify="center"
                direction="row"
                spacing={2}
                alignContent="center"
                alignItems="center"
            >
                {children}
            </Grid>
        </Grid>
    )
}
