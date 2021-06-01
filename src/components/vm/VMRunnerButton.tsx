import React from "react"
import { Button } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"

export default function VMRunnerButton(props: {
    runner: IT4ProgramRunner
    run: () => void
    cancel: () => void
}) {
    const { runner, run, cancel } = props
    const disabled = !runner
    const status = useChange(runner, t => t?.status)
    const handleRun = () => run()
    const handleCancel = () => cancel()
    const running = status === VMStatus.Running

    return (
        <Button
            disabled={disabled}
            variant="contained"
            onClick={running ? handleCancel : handleRun}
            color={running ? "default" : "primary"}
            startIcon={running ? <StopIcon /> : <PlayArrowIcon />}
        >
            {running ? "Stop" : "Run"}
        </Button>
    )
}
