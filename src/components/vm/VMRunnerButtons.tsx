import React from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/VMrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"
import { Grid } from "@material-ui/core"
import PauseIcon from "@material-ui/icons/Pause"

export default function VMRunnerButtons(props: {
    runner: VMProgramRunner
    run: () => void
    cancel: () => void
}) {
    const { runner, run, cancel } = props
    const status = useChange(runner, t => t?.status)
    const disabled = !runner
    const stopped = !status || status === VMStatus.Stopped

    console.log('runner status', status)

    const handleRun = () => run()
    const handleCancel = () => cancel()
    const handlePause = () => runner.pause()

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
        </>
    )
}
