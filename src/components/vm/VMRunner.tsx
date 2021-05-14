import React, { useCallback } from "react"
import { Grid, Button } from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import LoadingProgress from "../ui/LoadingProgress"
import useChange from "../../jacdac/useChange"
import PlayArrowIcon from "@material-ui/icons/PlayArrow"

export default function VMRunner(props: { json: IT4Program; bus: JDBus }) {
    const { json, bus } = props
    const factory = useCallback(
        bus => json && new IT4ProgramRunner(json, bus),
        [bus, json]
    )
    const testRunner = useChange(bus, factory)
    const status = useChange(testRunner, t => t?.status)

    if (!testRunner) return <LoadingProgress />

    const handleRun = () => testRunner.start()
    const handleCancel = () => testRunner.cancel()
    const running = status !== VMStatus.Ready // TODO fix

    return (
        <Button
            variant="contained"
            onClick={running ? handleCancel : handleRun}
            color={running ? "default" : "primary"}
            startIcon={running ? <LoadingProgress /> : <PlayArrowIcon />}
        >
            {running ? "Stop" : "Run"}
        </Button>
    )
}
