import { Grid } from "@mui/material"
import React from "react"
import BlockClientRoles from "../blockly/BlockRoles"
import StartSimulatorButton from "../buttons/StartSimulatorButton"

export default function JacscriptToolbar(props: {}) {
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            <Grid item>
                <StartSimulatorButton />
            </Grid>
            <BlockClientRoles />
        </Grid>
    )
}
