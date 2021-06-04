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
    const stopped = !status || status === VMStatus.Stopped

    return (
        <IconButtonWithTooltip
            title={stopped ? "start" : "stop"}
            disabled={disabled}
            onClick={stopped ? handleRun : handleCancel}
        >
            {stopped ? <PlayArrowIcon /> : <StopIcon />}
        </IconButtonWithTooltip>
    )
}
