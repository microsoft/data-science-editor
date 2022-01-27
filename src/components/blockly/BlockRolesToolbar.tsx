import { Grid } from "@mui/material"
import React, { ReactNode } from "react"
import BlockClientRoles from "./BlockRoles"
import StartSimulatorButton from "../buttons/StartSimulatorButton"

export default function BlockRolesToolbar(props: {
    children?: ReactNode
}) {
    const { children } = props
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            {children}
            <Grid item>
                <StartSimulatorButton useChip={true} />
            </Grid>
            <BlockClientRoles />
        </Grid>
    )
}
