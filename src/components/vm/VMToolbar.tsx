import { Grid } from "@material-ui/core"
import React from "react"
import { VMProgram } from "../../../jacdac-ts/src/vm/VMir"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import { VMProgramRunner } from "../../../jacdac-ts/src/vm/VMrunner"
import { WorkspaceJSON } from "./jsongenerator"
import VMRoles from "./VMRoles"
import VMRunnerButton from "./VMRunnerButton"
import VMSaveButton from "./VMSaveButton"
import VMStartSimulatorButton from "./VMStartSimulatorButton"
import { WorkspaceSvg } from "blockly"

export default function VMToolbar(props: {
    roleManager: RoleManager
    runner: VMProgramRunner
    run: () => void
    cancel: () => void
    xml: string
    source: WorkspaceJSON
    program: VMProgram
    workspace?: WorkspaceSvg
}) {
    const {
        roleManager,
        runner,
        run,
        cancel,
        xml,
        source,
        program,
        workspace,
    } = props
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
            <VMRoles roleManager={roleManager} workspace={workspace} />
        </Grid>
    )
}
