import { Grid } from "@material-ui/core"
import React from "react"
import { VMProgram } from "../../../jacdac-ts/src/vm/VMir"
import { RoleManager } from "../../../jacdac-ts/src/vm/rolemanager"
import { VMProgramRunner } from "../../../jacdac-ts/src/vm/VMrunner"
import VMRoles from "./VMRoles"
import VMRunnerButtons from "./VMRunnerButtons"
import VMStartSimulatorButton from "./VMStartSimulatorButton"
import { WorkspaceSvg } from "blockly"
import VMFileButtons from "./VMFileButtons"

export default function VMToolbar(props: {
    roleManager: RoleManager
    runner: VMProgramRunner
    run: () => Promise<void>
    cancel: () => Promise<void>
    xml: string
    program: VMProgram
    workspace?: WorkspaceSvg
}) {
    const { roleManager, runner, run, cancel, xml, program, workspace } = props
    return (
        <Grid
            container
            direction="row"
            spacing={1}
            alignItems="center"
            alignContent="center"
        >
            <VMFileButtons xml={xml} program={program} workspace={workspace} />
            <VMRunnerButtons runner={runner} run={run} cancel={cancel} workspace={workspace} />
            <Grid item>
                <VMStartSimulatorButton />
            </Grid>
            <VMRoles roleManager={roleManager} workspace={workspace} />
        </Grid>
    )
}
