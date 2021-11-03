import { Grid } from "@mui/material"
import React from "react"
import { VMProgramRunner } from "../../../jacdac-ts/src/vm/runner"
import BlockClientRoles from "../blockly/BlockRoles"
import VMRunnerButtons from "./VMRunnerButtons"
import VMStartSimulatorButton from "./VMStartSimulatorButton"

export default function VMToolbar(props: {
    runner: VMProgramRunner
    run: () => Promise<void>
    cancel: () => Promise<void>
}) {
    const { runner, run, cancel } = props
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            <VMRunnerButtons runner={runner} run={run} cancel={cancel} />
            <Grid item>
                <VMStartSimulatorButton />
            </Grid>
            <BlockClientRoles />
        </Grid>
    )
}
