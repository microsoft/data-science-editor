import React, { ChangeEvent, useEffect, useId, useState } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    BitRadioCmd,
    BitRadioReg,
} from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import { REPORT_RECEIVE } from "../../../jacdac-ts/src/jdom/constants"
import { jdunpack, PackedValues } from "../../../jacdac-ts/src/jdom/pack"
import { Packet } from "../../../jacdac-ts/src/jdom/packet"
import { Grid, TextField } from "@mui/material"
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew"
import DashboardRegisterValueFallback from "./DashboardRegisterValueFallback"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useRegister from "../hooks/useRegister"
import CmdButton from "../CmdButton"
import RegisterInput from "../RegisterInput"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import SendIcon from "@mui/icons-material/Send"

const HORIZON = 10

interface RadioMessageProps {
    time: number
    deviceSerial: number
    rssi: number
    payload: PackedValues
}

function RadioGroupSettings(props: { service: JDService; visible: boolean }) {
    const { service, visible } = props
    const register = useRegister(service, BitRadioReg.Group)
    return (
        <Grid item xs={12}>
            <RegisterInput register={register} visible={visible} />
        </Grid>
    )
}

function RadioTransmisionPowerSettings(props: {
    service: JDService
    visible: boolean
}) {
    const { service, visible } = props
    const register = useRegister(service, BitRadioReg.TransmissionPower)
    return (
        <Grid item xs={12}>
            <RegisterInput
                register={register}
                visible={visible}
                showRegisterName={true}
            />
        </Grid>
    )
}

function RadioMessageEditorItem(props: DashboardServiceProps) {
    const { service } = props
    const id = useId()
    const valueId = "value" + id
    const [value, setValue] = useState("")
    const enabledRegister = useRegister(service, BitRadioReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)

    const handleValueChange = (ev: ChangeEvent<HTMLInputElement>) =>
        setValue(ev.target.value.trim())
    const handleSend = async () => {
        const n = parseInt(value) ?? parseFloat(value)
        if (!isNaN(n))
            await service.sendCmdPackedAsync(BitRadioCmd.SendNumber, [n], true)
        else
            await service.sendCmdPackedAsync(
                BitRadioCmd.SendString,
                [value],
                true
            )
    }

    const handleEnabled = async () =>
        await enabledRegister.sendSetBoolAsync(!enabled, true)

    if (enabled === undefined)
        return <DashboardRegisterValueFallback register={enabledRegister} />

    return (
        <Grid container direction="row" spacing={1}>
            <Grid item>
                <CmdButton
                    title={enabled ? "disable radio" : "enable radio"}
                    onClick={handleEnabled}
                    color={enabled ? "primary" : undefined}
                    icon={<PowerSettingsNewIcon />}
                />
            </Grid>
            <Grid item>
                <TextField
                    size="small"
                    type="number"
                    id={valueId}
                    label="Message"
                    helperText="Number will be encoded as a number message."
                    value={value}
                    onChange={handleValueChange}
                />
            </Grid>
            <Grid item>
                <CmdButton
                    title="send message"
                    disabled={!enabled}
                    onClick={handleSend}
                >
                    <SendIcon />
                </CmdButton>
            </Grid>
        </Grid>
    )
}

export default function DashboardBitRadio(props: DashboardServiceProps) {
    const { service, expanded } = props
    const [lastEvents, setLastEvents] = useState<RadioMessageProps[]>([])

    const appendMessage = (data: PackedValues) => {
        if (!data) return

        const [time, deviceSerial, rssi, ...payload] = data
        setLastEvents(lastEvents => {
            const evs = lastEvents.slice(0)
            const msg = { time, deviceSerial, rssi, payload }
            evs.push(msg)
            while (evs.length > HORIZON) evs.shift()
            return lastEvents
        })
    }

    useEffect(
        () =>
            service.subscribe(REPORT_RECEIVE, (pkt: Packet) => {
                let values: PackedValues
                const { data, serviceCommand } = pkt
                switch (serviceCommand) {
                    case BitRadioCmd.NumberReceived:
                        values = jdunpack(data, "u32 u32 i8 x[3] f64 s")
                        break
                    case BitRadioCmd.StringReceived:
                        values = jdunpack(data, "u32 u32 i8 x[1] s")
                        break
                    case BitRadioCmd.BufferReceived:
                        values = jdunpack(data, "u32 u32 i8 x[1] b")
                        break
                }
                if (values)
                    appendMessage(
                        values.filter(v => v !== undefined && v !== "")
                    )
            }),
        [service, lastEvents]
    )

    const text = lastEvents
        .map(ev =>
            ev.payload?.filter(v => v !== undefined && v !== "").join(",")
        )
        .filter(el => !!el)
        .join("\n")

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <pre>{text || "no radio messages"}</pre>
            </Grid>
            <Grid item xs={12}>
                <RadioMessageEditorItem {...props} />
            </Grid>
            {expanded && (
                <RadioGroupSettings service={service} visible={expanded} />
            )}
            {expanded && (
                <RadioTransmisionPowerSettings
                    service={service}
                    visible={expanded}
                />
            )}
        </Grid>
    )
}
