import React, { useEffect, useState } from "react"
import {
    SoundPlayerCmd,
    SoundPlayerReg,
} from "../../../jacdac-ts/src/jdom/constants"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { Grid, MenuItem, SelectChangeEvent } from "@mui/material"
import { useChangeAsync } from "../../jacdac/useChange"
import { jdpack } from "../../../jacdac-ts/src/jdom/pack"
import { SoundPlayerServer } from "../../../jacdac-ts/src/servers/soundplayerserver"
import { Howl } from "howler"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"
import VolumeWidget from "../widgets/VolumeWidget"
import SelectWithLabel from "../ui/SelectWithLabel"
import PlayArrowIcon from "@mui/icons-material/PlayArrow"
import CmdButton from "../CmdButton"
import { withPrefix } from "gatsby"

export default function DashboardSoundPlayer(props: DashboardServiceProps) {
    const { service, expanded } = props
    const volumeRegister = useRegister(service, SoundPlayerReg.Volume)
    const [sound, setSound] = useState("")
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister, props)
    const server = useServiceServer<SoundPlayerServer>(service)
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
    useEffect(() => {
        if (server && volume)
            server.onPlay = (name: string) => {
                const sound = new Howl({
                    src: [withPrefix(`/sounds/${name}.wav`)],
                    volume: volume,
                })
                sound.play()
            }
        return () => {
            if (server) server.onPlay = undefined
        }
    }, [volume, server])
    useEffect(() => setSound(sounds?.[0]?.[1] || ""), [sounds])

    const handlePlaySound = async () => {
        await service.sendCmdAsync(
            SoundPlayerCmd.Play,
            jdpack("s", [sound]),
            false
        )
    }
    const handleSelectSound = (ev: SelectChangeEvent<string>) => {
        const newSound = ev.target.value
        setSound(newSound)
    }

    if (!sounds) return <LoadingProgress />

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SelectWithLabel
                    label="sound"
                    fullWidth={true}
                    disabled={!sound}
                    value={sound}
                    onChange={handleSelectSound}
                >
                    {sounds.map(([, name]) => (
                        <MenuItem key={name} value={name}>
                            {name}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item>
                <CmdButton
                    title="play"
                    icon={<PlayArrowIcon />}
                    onClick={handlePlaySound}
                />
            </Grid>
            {expanded && (
                <Grid item xs={12}>
                    <VolumeWidget register={volumeRegister} {...props} />
                </Grid>
            )}
        </Grid>
    )
}
