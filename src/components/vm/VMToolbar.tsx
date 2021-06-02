import { Grid } from "@material-ui/core"
import React from "react"
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import { IT4ProgramRunner } from "../../../jacdac-ts/src/vm/vmrunner"
import { WorkspaceJSON } from "./jsongenerator"
import VMRoles from "./VMRoles"
import VMRunnerButton from "./VMRunnerButton"
import VMSaveButton from "./VMSaveButton"
import VMStartSimulatorButton from "./VMStartSimulatorButton"

export default function VMToolbar(props: {
    roleManager: RoleManager
    runner: IT4ProgramRunner
    run: () => void
    cancel: () => void
    xml: string
    source: WorkspaceJSON
    program: IT4Program
}) {
    const { roleManager, runner, run, cancel, xml, source, program } = props
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            <Grid item>
                <VMRunnerButton runner={runner} run={run} cancel={cancel} />
            </Grid>
            <Grid item>
                <VMSaveButton xml={xml} source={source} program={program} />
            </Grid>
            <Grid item>
                <VMStartSimulatorButton />
            </Grid>
            <VMRoles roleManager={roleManager} />
        </Grid>
    )
}
