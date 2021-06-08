import React, { useEffect, useMemo, useState } from "react"
import useChange from "../../jacdac/useChange"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/runner"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Chip, Grid, Typography } from "@material-ui/core"
import PauseIcon from "@material-ui/icons/Pause"
import { arrayConcatMany } from "../../../jacdac-ts/src/jdom/utils"
import { VM_BREAKPOINT } from "../../../jacdac-ts/src/vm/utils"
import { VMHandler, VMProgram } from "../../../jacdac-ts/src/vm/ir"
import { WorkspaceSvg } from "blockly"
import PlayForWorkIcon from "@material-ui/icons/PlayForWork"
import useMounted from "../hooks/useMounted"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import BugReportIcon from "@material-ui/icons/BugReport"

function useWorkspaceBreakpoints(program: VMProgram, workspace: WorkspaceSvg) {
    const breakpoints = useMemo(
        () =>
            arrayConcatMany(
                program?.handlers?.map(h => h.commands.map(cmd => cmd.sourceId))
            )?.filter(id => !!id) || [],
        [program]
    )
    const setBreakpointHighlight = (sourceId: string) => {
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
    const status = useChange(runner, t => t?.status)
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

    //console.log("runner status", status)

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
                <IconButtonWithProgress
                    title={pausing ? "cancel pause" : paused ? "step" : "pause"}
                    disabled={disabled}
                    indeterminate={pausing}
                    onClick={
                        pausing
                            ? handleResume
                            : paused
                            ? handleStep
                            : handlePause
                    }
                >
                    {paused ? <PlayForWorkIcon /> : <PauseIcon />}
                </IconButtonWithProgress>
            </Grid>
            {(pausing || paused) && (
                <Grid item>
                    <Chip
                        icon={<BugReportIcon />}
                        label={pausing ? "pausing" : "paused"}
                        color={"secondary"}
                    />
                </Grid>
            )}
        </>
    )
}
