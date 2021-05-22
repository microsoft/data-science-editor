import React, { useCallback, useContext, useMemo } from "react"
import { Button } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import LoadingProgress from "../ui/LoadingProgress"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"

export default function VMRunner(props: { program: IT4Program }) {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { program } = props
    const factory = useCallback(
        bus => program && new IT4ProgramRunner(program, bus),
        [program]
    )
    const testRunner = useMemo(() => factory(bus), [program])
    const status = useChange(testRunner, t => t?.status)
    const handleRun = () => testRunner.start()
    const handleCancel = () => testRunner.cancel()
    const running = status === VMStatus.Running
    const disabled = !testRunner

    return (
        <Button
            disabled={disabled}
            variant="contained"
            onClick={running ? handleCancel : handleRun}
            color={running ? "default" : "primary"}
            startIcon={running ? <LoadingProgress /> : <PlayArrowIcon />}
        >
            {running ? "Stop" : "Run"}
        </Button>
    )
}
