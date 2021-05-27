import React, { useContext, useEffect, useState } from "react"
import { Button } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import StopIcon from "@material-ui/icons/Stop"

export default function VMRunner(props: {
    program: IT4Program
    autoStart?: boolean
}) {
    const { program, autoStart: autoStartDefault } = props
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const [testRunner, setTestRunner] = useState<IT4ProgramRunner>()
    const [autoStart, setAutoStart] = useState(!!autoStartDefault)

    useEffect(() => {
        const runner = program && new IT4ProgramRunner(program, bus)
        setTestRunner(runner)
        if (runner && autoStart) runner.start()
        return () => runner?.cancel()
    }, [program, autoStart])

    const disabled = !testRunner
    const status = useChange(testRunner, t => t?.status)
    const handleRun = () => {
        setAutoStart(autoStartDefault)
        try {
            testRunner.start()
        } catch (e) {
            console.debug(e)
        }
    }
    const handleCancel = () => {
        setAutoStart(false)
        testRunner.cancel()
    }
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
