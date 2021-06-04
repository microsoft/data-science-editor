import React, { useEffect, useMemo, useState } from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/VMrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Grid } from "@material-ui/core"
import PauseIcon from "@material-ui/icons/Pause"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { VM_BREAKPOINT } from "../../../jacdac-ts/src/vm/VMutils"
import { VMHandler, VMProgram } from "../../../jacdac-ts/src/vm/VMir"
import { WorkspaceSvg } from "blockly"
import PlayForWorkIcon from "@material-ui/icons/PlayForWork"

function useWorkspaceBreakpoints(program: VMProgram, workspace: WorkspaceSvg) {
    const breakpoints = useMemo(
        () =>
            arrayConcatMany(
                program?.handlers?.map(h => h.commands.map(cmd => cmd.sourceId))
            )?.filter(id => !!id) || [],
        [program]
    )
    const setBreakpoint = (sourceId: string) => {
        workspace?.highlightBlock(sourceId)
    }

    return {
        breakpoints,
        setBreakpoint,
    }
}

export default function VMRunnerButtons(props: {
    runner: VMProgramRunner
    run: () => void
    cancel: () => void
    workspace: WorkspaceSvg
}) {
    const { runner, run, cancel, workspace } = props
    const status = useChange(runner, t => t?.status)
    const disabled = !runner
    const stopped = !status || status === VMStatus.Stopped
    const program = runner?.program
    const [paused, setPaused] = useState(false)
    const { breakpoints, setBreakpoint } = useWorkspaceBreakpoints(
        program,
        workspace
    )

    console.log("runner status", status)

    const handleRun = () => {
        runner?.clearBreakpoints()
        run()
    }
    const handleCancel = () => {
        runner?.clearBreakpoints()
        cancel()
        setPaused(false)
    }
    const handlePause = () => setPaused(!paused)
    const handleStep = () => runner?.resume()

    // register breakpoint handler
    useEffect(
        () =>
            runner?.subscribe(
                VM_BREAKPOINT,
                (_: VMHandler, sourceId?: string) => setBreakpoint(sourceId)
            ),
        [runner]
    )
    // register breakpoints
    useEffect(() => {
        if (paused) runner?.setBreakpoints(breakpoints)
        return () => paused && runner?.clearBreakpoints()
    }, [runner, paused])

    return (
        <>
            <Grid item>
                <IconButtonWithTooltip
                    title={stopped ? "start" : "stop"}
                    disabled={disabled}
                    onClick={stopped ? handleRun : handleCancel}
                >
                    {stopped ? <PlayArrowIcon /> : <StopIcon />}
                </IconButtonWithTooltip>{" "}
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={"pause"}
                    disabled={disabled}
                    onClick={handlePause}
                >
                    <PauseIcon />
                </IconButtonWithTooltip>
            </Grid>
            {paused && (
                <Grid item>
                    <IconButtonWithTooltip
                        title={"step"}
                        disabled={disabled}
                        onClick={handleStep}
                    >
                        <PlayForWorkIcon />
                    </IconButtonWithTooltip>
                </Grid>
            )}
        </>
    )
}
