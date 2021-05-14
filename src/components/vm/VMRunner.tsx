import React, { useCallback } from "react"
import {
    Grid,
    Button
} from "@material-ui/core"
// tslint:disable-next-line: match-default-export-name no-submodule-imports
import { IT4Program } from "../../../jacdac-ts/src/vm/ir"
import { IT4ProgramRunner, VMStatus } from "../../../jacdac-ts/src/vm/vmrunner"
import { JDBus } from "../../../jacdac-ts/src/jdom/bus"
import LoadingProgress from "../ui/LoadingProgress"
import useChange from "../../jacdac/useChange"

export default function VMRunner(props: {
    json: IT4Program
    bus: JDBus
}) {
    const {
        json, bus
    } = props
    const factory = useCallback(
        (bus) => json && new IT4ProgramRunner(json, bus),
        [bus, json]
    )
    const testRunner = useChange(bus, factory)
    const status = useChange(testRunner, t => t?.status)
    const handleRun = () => testRunner.start()
    const handleCancel = () => testRunner.cancel()

    if (!testRunner) return <LoadingProgress />

    return (
        <Grid container spacing={2}>
            <Grid item xs={3}>
            <Button
                    variant="outlined"
                    color={status !== VMStatus.Ready ? "primary" : "default"}
                    onClick={handleRun}
                >
                    Run
                </Button>
            <Button variant="outlined" onClick={handleCancel}>
                    Cancel
            </Button>
            </Grid>
        </Grid>
    )
}
