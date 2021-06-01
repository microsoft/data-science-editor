import { Grid } from "@material-ui/core"
import React from "react"
import { IT4ProgramRunner } from "../../../jacdac-ts/src/vm/vmrunner"
import VMRunnerButton from "./VMRunnerButton"
import VMSaveButton from "./VMSaveButton"

export default function VMToolbar(props: {
    runner: IT4ProgramRunner
    run: () => void
    cancel: () => void
    xml: string
}) {
    const { runner, run, cancel, xml } = props
    return (
        <Grid container direction="row" spacing={1}>
            <Grid item>
                <VMRunnerButton runner={runner} run={run} cancel={cancel} />
            </Grid>
            <Grid item>
                <VMSaveButton xml={xml} />
            </Grid>
        </Grid>
    )
}
