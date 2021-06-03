import React from "react"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { VMProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/VMrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"
import IconButtonWithTooltip from "../ui/IconButtonWithTooltip"

export default function VMRunnerButton(props: {
    runner: VMProgramRunner
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
        <IconButtonWithTooltip
            title={running ? "stop" : "start"}
            disabled={disabled}
            onClick={running ? handleCancel : handleRun}
        >
            {running ? <StopIcon /> : <PlayArrowIcon />}
        </IconButtonWithTooltip>
    )
}
