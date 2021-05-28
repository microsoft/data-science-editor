import React, { useEffect, useState } from "react"
import { Button } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import StopIcon from "@material-ui/icons/Stop"

export default function VMRunner(props: {
    runner: IT4ProgramRunner
    autoStart?: boolean
}) {
    const { runner, autoStart: autoStartDefault } = props
    const disabled = !runner
    const status = useChange(runner, t => t?.status)
    const [autoStart, setAutoStart] = useState<boolean>(!!autoStartDefault)
    const handleRun = () => {
        setAutoStart(!!autoStartDefault)
        try {
            runner.start()
        } catch (e) {
            console.debug(e)
        }
    }
    const handleCancel = () => {
        setAutoStart(false)
        runner.cancel()
    }
    const running = status === VMStatus.Running

    // auto start
    useEffect(() => {
        if (autoStart && runner) runner.start()
        return () => runner?.cancel()
    }, [runner, autoStart])

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
