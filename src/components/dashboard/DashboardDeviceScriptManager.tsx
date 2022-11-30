import React, { ChangeEvent } from "react"
import { Grid } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import StopIcon from "@mui/icons-material/Stop"
import CmdButton from "../CmdButton"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { SystemStatusCodes } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import useRegister from "../hooks/useRegister"
import {
    DeviceScriptManagerReg,
    SystemReg,
} from "../../../jacdac-ts/src/jdom/constants"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"

export default function DashboardDeviceScriptManager(
    props: DashboardServiceProps
) {
    const { service, expanded, ...rest } = props

    const runningRegister = useRegister(service, DeviceScriptManagerReg.Running)
    const autoStartRegister = useRegister(
        service,
        DeviceScriptManagerReg.Autostart
    )
    const loggingRegister = useRegister(service, DeviceScriptManagerReg.Logging)
    const statusCodeRegister = useRegister(service, SystemReg.StatusCode)
    const running = useRegisterBoolValue(runningRegister, rest)
    const autoStart = useRegisterBoolValue(autoStartRegister, rest)
    const logging = useRegisterBoolValue(loggingRegister, rest)
    const [statusCode] = useRegisterUnpackedValue(statusCodeRegister, rest)
    const disabled =
        statusCode === undefined ||
        statusCode === SystemStatusCodes.WaitingForInput

    const handleRun = () => runningRegister?.sendSetBoolAsync(true, true)
    const handleStop = () => runningRegister?.sendSetBoolAsync(false, true)
    const handleAutoStartChange = (
        event: ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => autoStartRegister?.sendSetBoolAsync(checked, true)
    const handleLoggingChange = (
        event: ChangeEvent<HTMLInputElement>,
        checked: boolean
    ) => loggingRegister?.sendSetBoolAsync(checked, true)

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <CmdButton
                    disabled={disabled}
                    variant="outlined"
                    title={running ? "running" : "stopped"}
                    onClick={running ? handleStop : handleRun}
                    icon={running ? <StopIcon /> : <PlayArrowIcon />}
                >
                    {running ? "stop" : "start"}
                </CmdButton>
            </Grid>
            {expanded && (
                <Grid item xs>
                    <SwitchWithLabel
                        label="auto start"
                        checked={autoStart || false}
                        disabled={autoStart === undefined}
                        onChange={handleAutoStartChange}
                    />
                </Grid>
            )}
            {expanded && (
                <Grid item xs>
                    <SwitchWithLabel
                        label="logging"
                        checked={logging || false}
                        disabled={logging === undefined}
                        onChange={handleLoggingChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
