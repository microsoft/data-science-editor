import { Chip } from "@mui/material"
import React, { useEffect, useState } from "react"
import useRegister from "../hooks/useRegister"
import {
    JacscriptManagerCmd,
    JacscriptManagerReg,
    SystemEvent,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import DeviceAvatar from "../devices/DeviceAvatar"
import useEffectAsync from "../useEffectAsync"
import useEvent from "../hooks/useEvent"
import { EVENT } from "../../../jacdac-ts/src/jdom/constants"
import { OutPipe } from "../../../jacdac-ts/src/jdom/pipes"
import useJacscript from "./JacscriptContext"

export default function JacscriptManagerChip(props: {
    service: JDService
    selected: boolean
    setSelected: () => void
}) {
    const { service, selected, setSelected } = props
    const { compiled: jscCompiled } = useJacscript()
    const [deploying, setDeploying] = useState(false)
    const [deployError, setDeployError] = useState<Error>(undefined)

    const statusCodeChangedEvent = useEvent(
        service,
        SystemEvent.StatusCodeChanged
    )
    const runningRegister = useRegister(service, JacscriptManagerReg.Running)
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
        JacscriptManagerReg.Autostart
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

    const label = running ? "stop " : "start"
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
        const { binary } = jscCompiled || {}
        if (!service || !selected) return
        try {
            setDeploying(true)
            setDeployError(undefined)
            await OutPipe.sendBytes(
                service,
                JacscriptManagerCmd.DeployBytecode,
                binary || new Uint8Array(0)
            )
        } catch (e) {
            setDeployError(e)
        } finally {
            setDeploying(false)
        }
    }, [service, selected, jscCompiled])

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
