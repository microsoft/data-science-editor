import React from "react"
import { Alert, Grid } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@mui/icons-material/Stop"
import CmdButton from "../CmdButton"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { SystemStatusCodes } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useRegister from "../hooks/useRegister"
import {
    JacscriptManagerReg,
    SystemReg,
} from "../../../jacdac-ts/src/jdom/constants"
import {
    RegisterOptions,
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"

function JacscriptManagerToolbar(
    props: { service: JDService } & RegisterOptions
) {
    const { service, ...rest } = props

    const runningRegister = useRegister(service, JacscriptManagerReg.Running)
    const autoStartRegister = useRegister(
        service,
        JacscriptManagerReg.Autostart
    )
    const loggingRegister = useRegister(service, JacscriptManagerReg.Logging)
    const statusCodeRegister = useRegister(service, SystemReg.StatusCode)

    const running = useRegisterBoolValue(runningRegister, rest)
    const autoStart = useRegisterBoolValue(autoStartRegister, rest)
    const logging = useRegisterBoolValue(loggingRegister, rest)
    const [statusCode] = useRegisterUnpackedValue(statusCodeRegister, rest)

    const noProgram = statusCode === SystemStatusCodes.WaitingForInput
    const disabled =
        statusCode === undefined ||
        statusCode === SystemStatusCodes.WaitingForInput

    const handleRun = () => runningRegister?.sendSetBoolAsync(true, true)
    const handleStop = () => runningRegister?.sendSetBoolAsync(false, true)

    return (
        <Grid container spacing={1}>
            <Grid item>
                <CmdButton
                    disabled={disabled}
                    title={running ? "running" : "stopped"}
                    onClick={running ? handleStop : handleRun}
                    icon={running ? <StopIcon /> : <PlayArrowIcon />}
                />
            </Grid>
            <Grid item>
                <SwitchWithLabel
                    label="auto start"
                    checked={autoStart}
                    disabled={autoStart === undefined}
                />
            </Grid>
            <Grid item>
                <SwitchWithLabel
                    label="logging"
                    checked={logging}
                    disabled={logging === undefined}
                />
            </Grid>
            {noProgram && (
                <Grid item xs={12}>
                    <Alert severity="warning">Waiting for valid program.</Alert>
                </Grid>
            )}
        </Grid>
    )
}

export default function DashboardJacscriptManager(
    props: DashboardServiceProps
) {
    const { service, ...rest } = props
    return <JacscriptManagerToolbar service={service} {...rest} />
}
