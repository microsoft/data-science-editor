import { Grid, Slider } from "@mui/material"
import React, { lazy, useContext, useEffect } from "react"
import { BuzzerCmd, BuzzerReg } from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import BuzzerServer from "../../../jacdac-ts/src/servers/buzzerserver"
import VolumeDownIcon from "@mui/icons-material/VolumeDown"
import Suspense from "../ui/Suspense"
import useRegister from "../hooks/useRegister"
import { Alert } from "@mui/material"
import { IconButton } from "gatsby-theme-material-ui"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import WebAudioContext from "../ui/WebAudioContext"
const PianoWidget = lazy(() => import("../widgets/PianoWidget"))

export default function DashboardBuzzer(props: DashboardServiceProps) {
    const { service } = props
    const server = useServiceServer<BuzzerServer>(service)
    const color = server ? "secondary" : "primary"
    const volumeRegister = useRegister(service, BuzzerReg.Volume)
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister, props)
    const { playTone, onClickActivateAudioContext, activated } =
        useContext(WebAudioContext)

    // listen for playTone commands from the buzzer
    useEffect(
        () =>
            server?.subscribe<{
                frequency: number
                duration: number
                volume: number
            }>(BuzzerServer.PLAY_TONE, ({ frequency, duration, volume }) =>
                playTone?.(frequency, duration, volume)
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
        volumeRegister.sendSetPackedAsync([newValue], true)
    }
    const handleUnlock = () => sendPlayTone(400)

    return (
        <>
            {server && !activated && (
                <Grid item xs>
                    <Alert severity="warning">
                        Click to activate sounds. &nbsp;
                        <IconButton
                            aria-label="unlock sounds"
                            onClick={handleUnlock}
                            size="large"
                        >
                            <VolumeUpIcon />
                        </IconButton>
                    </Alert>
                </Grid>
            )}
            <Grid item xs aria-hidden={true}>
                <Suspense>
                    <PianoWidget playTone={sendPlayTone} />
                </Suspense>
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
                                step={0.1}
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
