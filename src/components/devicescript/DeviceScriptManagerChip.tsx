import { Chip } from "@mui/material"
import React, { useContext, useEffect, useState } from "react"
import useRegister from "../hooks/useRegister"
import {
    DeviceScriptManagerCmd,
    DeviceScriptManagerReg,
    SystemEvent,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import DeviceAvatar from "../devices/DeviceAvatar"
import useEffectAsync from "../useEffectAsync"
import useEvent from "../hooks/useEvent"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"
import useDeviceScript from "./DeviceScriptContext"
import useBrainDevice from "../brains/useBrainDevice"
import useSnackbar from "../hooks/useSnackbar"

export default function DeviceScriptManagerChip(props: {
    service: JDService
    selected: boolean
    setSelected: () => void
}) {
    const { service, selected, setSelected } = props
    const { device } = service
    const { shortId } = device
    const { bytecode } = useDeviceScript()
    const [deploying, setDeploying] = useState(false)
    const [deployError, setDeployError] = useState<Error>(undefined)
    const brainDevice = useBrainDevice(device)
    const { enqueueSnackbar } = useSnackbar()

    const statusCodeChangedEvent = useEvent(
        service,
        SystemEvent.StatusCodeChanged
    )
    const runningRegister = useRegister(service, DeviceScriptManagerReg.Running)
    const running = useRegisterBoolValue(runningRegister, { visible: true })

    useEffect(
        () =>
            statusCodeChangedEvent.subscribe(EVENT, () =>
                runningRegister?.sendGetAsync()
            ),
        [statusCodeChangedEvent, runningRegister]
    )

    const autoStartRegister = useRegister(
        service,
        DeviceScriptManagerReg.Autostart
    )

    const stopped = !running
    const disabled = deploying

    const handleRun = () => runningRegister?.sendSetBoolAsync(true, true)
    const handleStop = () => runningRegister?.sendSetBoolAsync(false, true)
    const handleSelect = () => {
        setSelected()
        handleRun()
    }
    const handleClick = selected
        ? stopped
            ? handleRun
            : handleStop
        : handleSelect

    const label = `${shortId} ${running ? "stop " : "start"}`
    const title = disabled
        ? "uploading..."
        : running
        ? "stop running code"
        : "start running code"

    // auto-start == selected
    useEffectAsync(
        () => autoStartRegister?.sendSetBoolAsync(selected, true),
        [autoStartRegister, selected]
    )

    // auto-deploy selected service
    useEffectAsync(async () => {
        if (!service || !selected) return
        try {
            setDeploying(true)
            setDeployError(undefined)
            if (brainDevice?.scriptId) {
                enqueueSnackbar(
                    "Disabling device automatic script deployment in brain manager.",
                    "warning"
                )
                await brainDevice.updateScript("")
            }
            await OutPipe.sendBytes(
                service,
                DeviceScriptManagerCmd.DeployBytecode,
                bytecode || new Uint8Array(0)
            )
        } catch (e) {
            setDeployError(e)
        } finally {
            setDeploying(false)
        }
    }, [service, selected, bytecode, brainDevice])

    // stop after deselected
    useEffectAsync(
        () => !selected && runningRegister?.sendSetBoolAsync(false, true),
        [runningRegister, selected]
    )

    return (
        <Chip
            label={label}
            title={title}
            color={deployError ? "error" : selected ? "secondary" : undefined}
            variant={selected ? "filled" : undefined}
            avatar={<DeviceAvatar device={service.device} />}
            onClick={handleClick}
            disabled={disabled}
        />
    )
}
