import React, { useEffect, useMemo, useState } from "react"
import { useChangeAsync } from "../../jacdac/useChange"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/VMrunner"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Grid, Typography } from "@material-ui/core"
import PauseIcon from "@material-ui/icons/Pause"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { VM_BREAKPOINT } from "../../../jacdac-ts/src/vm/VMutils"
import { VMHandler, VMProgram } from "../../../jacdac-ts/src/vm/VMir"
import { WorkspaceSvg } from "blockly"
import PlayForWorkIcon from "@material-ui/icons/PlayForWork"
import useMounted from "../hooks/useMounted"

function useWorkspaceBreakpoints(program: VMProgram, workspace: WorkspaceSvg) {
    const breakpoints = useMemo(
        () =>
            arrayConcatMany(
                program?.handlers?.map(h =>
                    // skip first command to avoid breaking on the event itself
                    h.commands.slice(1).map(cmd => cmd.sourceId)
                )
            )?.filter(id => !!id) || [],
        [program]
    )
    const setBreakpointHighlight = (sourceId: string) => {
        console.debug(`breakpoint`, { sourceId })
        workspace?.highlightBlock(sourceId)
    }

    return {
        breakpoints,
        setBreakpointHighlight,
    }
}

export default function VMRunnerButtons(props: {
    runner: VMProgramRunner
    run: () => Promise<void>
    cancel: () => Promise<void>
    workspace: WorkspaceSvg
}) {
    const { runner, run, cancel, workspace } = props
    const status = useChangeAsync(runner, t => t?.statusAsync())
    const stopped = !status || status === VMStatus.Stopped
    const program = runner?.program
    const [indeterminate, setIndeterminate] = useState(false)
    const [breakpoint, setBreakpoint] = useState<string>(undefined)
    const pausing = breakpoint === ""
    const paused = !!breakpoint?.length
    const mounted = useMounted()
    const disabled = indeterminate || !runner
    const { breakpoints, setBreakpointHighlight } = useWorkspaceBreakpoints(
        program,
        workspace
    )

    console.log("runner status", status)

    const handleRun = async () => {
        try {
            setIndeterminate(true)
            setBreakpoint(undefined)
            await run()
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handleCancel = async () => {
        try {
            setIndeterminate(true)
            setBreakpoint(undefined)
            await cancel()
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handleResume = async () => {
        try {
            setIndeterminate(true)
            setBreakpoint(undefined)
            await runner.clearBreakpointsAsync()
            await runner.resumeAsync()
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handlePause = async () => {
        try {
            setIndeterminate(true)
            await runner.setBreakpointsAsync(breakpoints)
            await runner.resumeAsync()
            setBreakpoint("")
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handleStep = () => runner.step()

    // register breakpoint handler
    useEffect(
        () =>
            runner?.subscribe(
                VM_BREAKPOINT,
                (_: VMHandler, sourceId?: string) => {
                    console.log("breakpoint", { sourceId, mounted: mounted() })
                    if (mounted()) setBreakpoint(sourceId)
                }
            ),
        [runner]
    )

    // setting blockly breakpoint
    useEffect(() => {
        setBreakpointHighlight(breakpoint)
        return () => setBreakpointHighlight(undefined)
    }, [breakpoint])

    // reset breakpoint in ui when runner, paused mode changes
    useEffect(() => setBreakpoint(undefined), [runner])

    return (
        <>
            <Grid item>
                <IconButtonWithTooltip
                    title={paused ? "resume" : stopped ? "start" : "stop"}
                    disabled={disabled}
                    onClick={
                        paused
                            ? handleResume
                            : stopped
                            ? handleRun
                            : handleCancel
                    }
                >
                    {paused || stopped ? <PlayArrowIcon /> : <StopIcon />}
                </IconButtonWithTooltip>{" "}
            </Grid>
            <Grid item>
                <IconButtonWithTooltip
                    title={paused ? "step" : "pause"}
                    disabled={disabled}
                    onClick={paused ? handleStep : handlePause}
                >
                    {paused ? <PlayForWorkIcon /> : <PauseIcon />}
                </IconButtonWithTooltip>
            </Grid>
            {(pausing || paused) && (
                <Grid item>
                    <Typography variant="caption">
                        {pausing ? "pausing" : "paused"}
                    </Typography>
                </Grid>
            )}
        </>
    )
}
