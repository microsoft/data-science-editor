import React from "react"
import { Grid } from "@mui/material"
import JacscriptManagerChipItems from "./JacscriptManagerChipItems"

export default function JacscriptToolbar() {
    return (
        <Grid container spacing={1}>
            <JacscriptManagerChipItems />
        </Grid>
    )
}
