import React, { useEffect, useMemo, useState } from "react"
import { useChangeAsync } from "../../jacdac/useChange"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/VMrunner"
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
    const setBreakpoint = (sourceId: string) => {
        console.debug(`breakpoint`, { sourceId })
        workspace?.highlightBlock(sourceId)
    }

    return {
        breakpoints,
        setBreakpoint,
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
    const [paused, setPaused] = useState(false)
    const mounted = useMounted()
    const disabled = indeterminate || !runner
    const { breakpoints, setBreakpoint } = useWorkspaceBreakpoints(
        program,
        workspace
    )

    console.log("runner status", status)

    const handleRun = async () => {
        try {
            setIndeterminate(true)
            await run()
            if (mounted()) setPaused(false)
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handleCancel = async () => {
        try {
            setIndeterminate(true)
            await cancel()
            if (mounted()) setPaused(false)
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handleResume = async () => {
        try {
            setIndeterminate(true)
            await runner.clearBreakpointsAsync()
            await runner.resumeAsync()
            if (mounted()) setPaused(false)
        } finally {
            if (mounted()) setIndeterminate(false)
        }
    }
    const handlePause = async () => {
        try {
            setIndeterminate(true)
            await runner.setBreakpointsAsync(breakpoints)
            await runner.resumeAsync()
            if (mounted()) setPaused(true)
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
                (_: VMHandler, sourceId?: string) => setBreakpoint(sourceId)
            ),
        [runner]
    )

    // reset breakpoint in ui when runner, paused mode changes
    useEffect(() => {
        if (!runner || !paused) setBreakpoint(undefined)
    }, [runner, paused])

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
        </>
    )
}
