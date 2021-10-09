import { Grid, TextField } from "@material-ui/core"
import React, {
    ChangeEvent,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react"
import {
    VibrationMotorReg,
    VibrationMotorCmd,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import { useRegisterBoolValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import useRegister from "../hooks/useRegister"
import WebAudioContext from "../ui/WebAudioContext"
import VibrationMotorServer from "../../../jacdac-ts/src/servers/vibrationmotorserver"
import SwitchWithLabel from "../ui/SwitchWithLabel"
import JDService from "../../../jacdac-ts/src/jdom/service"
import CmdButton from "../CmdButton"

const patterns: Record<
    string,
    {
        name: string
        duration: number
        speed: number
    }
> = {
    ".": {
        name: "dit",
        duration: 1,
        speed: 0.5,
    },
    "-": {
        name: "dat",
        duration: 3,
        speed: 0.5,
    },
    " ": {
        name: "space",
        duration: 1,
        speed: 0,
    },
    _: {
        name: "low dat",
        duration: 3,
        speed: 0.2,
    },
    "'": {
        name: "high dit",
        duration: 1,
        speed: 0.7,
    },
    ",": {
        name: "low dit",
        duration: 1,
        speed: 0.2,
    },
}

function PatternInput(props: { disabled?: boolean; service: JDService }) {
    const { onClickActivateAudioContext } = useContext(WebAudioContext)
    const { disabled, service } = props
    const [text, setText] = useState("...---...")
    const helperText = useMemo(
        () =>
            `Pattern of vibrations: ${Object.entries(patterns)
                .map(([key, value]) => `"${key}" ${value.name}`)
                .join(", ")}`,
        []
    )
    const handleSend = async () => {
        onClickActivateAudioContext() // enable audio context within click handler

        const tdit = 100
        const vscale = 0.25
        const pattern: [number, number][] = text
            .split("")
            .map(c => patterns[c])
            .filter(p => !!p)
            .flatMap(p => [
                [(p.duration * tdit) >> 3, p.speed * vscale],
                [tdit >> 3, 0],
            ])

        const data = jdpack<[[number, number][]]>("r: u8 u0.8", [pattern])
        await service.sendCmdAsync(VibrationMotorCmd.Vibrate, data)
    }
    const handleChange = (ev: ChangeEvent<HTMLInputElement>) => {
        const newValue = ev.target.value
        setText(
            newValue
                .split("")
                .filter(s => !!patterns[s])
                .join("")
        )
    }
    return (
        <Grid container spacing={1} direction="row">
            <Grid item xs>
                <TextField
                    title="vibration pattern"
                    helperText={helperText}
                    value={text}
                    onChange={handleChange}
                />
            </Grid>
            <Grid item>
                <CmdButton
                    variant="outlined"
                    title="send vibration pattern"
                    disabled={disabled}
                    onClick={handleSend}
                >
                    vibrate
                </CmdButton>
            </Grid>
        </Grid>
    )
}

export default function DashboardVibrationMotor(props: DashboardServiceProps) {
    const { service } = props
    const server = useServiceServer<VibrationMotorServer>(service)
    const enabledRegister = useRegister(service, VibrationMotorReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const { playTone } = useContext(WebAudioContext)

    // listen for playTone commands from the buzzer
    useEffect(
        () =>
            enabled &&
            server?.subscribe<{
                duration: number
                speed: number
            }>(VibrationMotorServer.VIBRATE_PATTERN, ({ duration, speed }) => {
                const ms = duration << 3
                playTone(440, ms, speed)
            }),
        [server, enabled]
    )

    const handleEnabled = async (ev: unknown, checked: boolean) => {
        await enabledRegister.sendSetBoolAsync(checked, true)
    }
    return (
        <>
            {enabled !== undefined && (
                <Grid item xs={12}>
                    <SwitchWithLabel
                        checked={enabled}
                        label={enabled ? "vibration on" : "vibration off"}
                        onChange={handleEnabled}
                    />
                </Grid>
            )}
            <Grid item xs={12}>
                <PatternInput disabled={!enabled} service={service} />
            </Grid>
        </>
    )
}
