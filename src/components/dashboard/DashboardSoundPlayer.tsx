import React, { useEffect } from "react"
import {
    SoundPlayerCmd,
    SoundPlayerReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { Button, Grid, Slider } from "@material-ui/core"
import { useChangeAsync } from "../../jacdac/useChange"
import JDService from "../../../jacdac-ts/src/jdom/service"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import SoundPlayerServer from "../../../jacdac-ts/src/servers/soundplayerserver"
import { Howl } from "howler"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"

function SoundButton(props: {
    service: JDService
    name: string
    duration: number
}) {
    const { name, service } = props
    const handleClick = async () => {
        await service.sendCmdAsync(
            SoundPlayerCmd.Play,
            jdpack("s", [name]),
            false
        )
    }
    return (
        <Button variant="outlined" onClick={handleClick}>
            {name}
        </Button>
    )
}

export default function DashboardSoundPlayer(props: DashboardServiceProps) {
    const { service } = props
    const volumeRegister = useRegister(service, SoundPlayerReg.Volume)
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister, props)
    const server = useServiceServer<SoundPlayerServer>(service)
    const color = server ? "secondary" : "primary"
    const sounds = useChangeAsync(
        service,
        async () => {
            try {
                const sounds = await service.receiveWithInPipe<
                    [number, string]
                >(SoundPlayerCmd.ListSounds, "u32 s", 1000)
                return sounds
            } catch (e) {
                console.error(e)
                return []
            }
        },
        [service]
    )
    const handleVolumeChange = async (
        ev: unknown,
        newValue: number | number[]
    ) => {
        volumeRegister.sendSetPackedAsync("u0.16", [newValue], true)
    }
    useEffect(() => {
        if (server && volume)
            server.onPlay = (name: string) => {
                const sound = new Howl({
                    src: [`/jacdac-docs/sounds/${name}.wav`],
                    volume: volume,
                })
                sound.play()
            }
        return () => {
            if (server) server.onPlay = undefined
        }
    }, [volume, server])

    if (!sounds) return <LoadingProgress />

    return (
        <Grid container spacing={1}>
            {sounds?.map(sound => (
                <Grid item xs key={sound[1]}>
                    <SoundButton
                        service={service}
                        duration={sound[0]}
                        name={sound[1]}
                    />
                </Grid>
            ))}
            {volume !== undefined && (
                <Grid item xs={12}>
                    <Slider
                        valueLabelDisplay="off"
                        min={0}
                        max={1}
                        step={0.05}
                        aria-label="volume"
                        value={volume}
                        color={color}
                        onChange={handleVolumeChange}
                    />
                </Grid>
            )}
        </Grid>
    )
}
