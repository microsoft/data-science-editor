import { Grid } from "@mui/material"
import React from "react"
import FeatureItem, { FeatureItemProps } from "./FeatureItem"

export default function CenterGrid(props: FeatureItemProps) {
    return (
        <Grid item xs={12} sm={8}>
            <Grid
                container
                spacing={2}
                direction="column"
                justifyContent="center"
                alignContent="center"
                alignItems="center"
            >
                <FeatureItem {...props} centered={true} />
            </Grid>
        </Grid>
    )
}
