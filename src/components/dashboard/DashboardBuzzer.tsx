import { Grid, Slider } from "@material-ui/core"
import React, { useEffect, useMemo } from "react"
import { BuzzerCmd, BuzzerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import usePlayTone from "../hooks/usePlayTone"
import BuzzerServer from "../../../jacdac-ts/src/servers/buzzerserver"
import PianoWidget from "../widgets/PianoWidget"
import VolumeDownIcon from "@material-ui/icons/VolumeDown"
import VolumeUpIcon from "@material-ui/icons/VolumeUp"

export default function DashboardBuzzer(props: DashboardServiceProps) {
    const { service } = props
    const server = useServiceServer<BuzzerServer>(service)
    const color = server ? "secondary" : "primary"
    const volumeRegister = service.register(BuzzerReg.Volume)
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister, props)
    const { playTone, setVolume, onClickActivateAudioContext } =
        usePlayTone(volume)

    // listen for playTone commands from the buzzer
    useEffect(
        () =>
            server?.subscribe<[number, number]>(
                BuzzerServer.PLAY_TONE,
                args => {
                    playTone?.(args[0], args[1])
                }
            ),
        [server]
    )

    const sendPlayTone = async (f: number) => {
        if (server) onClickActivateAudioContext() // enable audio context within click handler
        const vol = 1
        const period = 1000000 / f
        const duty = (period * vol) / 2
        const duration = 400
        const data = jdpack<[number, number, number]>("u16 u16 u16", [
            period,
            duty,
            duration,
        ])
        await service.sendCmdAsync(BuzzerCmd.PlayTone, data)
    }
    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        volumeRegister.sendSetPackedAsync("u0.8", [newValue], true)
    }
    useEffect(() => setVolume(volume), [volume])

    return (
        <>
            <Grid item xs>
                <PianoWidget playTone={sendPlayTone} />
            </Grid>
            {volume !== undefined && (
                <Grid item xs={12}>
                    <Grid container spacing={2}>
                        <Grid item>
                            <VolumeDownIcon color="disabled" />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                valueLabelDisplay="off"
                                min={0}
                                max={1}
                                step={0.05}
                                aria-label="volume"
                                value={volume}
                                color={color}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item>
                            <VolumeUpIcon color="disabled" />
                        </Grid>
                    </Grid>
                </Grid>
            )}
        </>
    )
}
