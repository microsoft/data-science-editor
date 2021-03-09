import React, { useEffect } from "react";
import { SoundPlayerCmd, SoundPlayerReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useServiceHost from "../hooks/useServiceHost";
import { Button, Grid, Slider } from "@material-ui/core";
import { useChangeAsync } from "../../jacdac/useChange";
import { JDService } from "../../../jacdac-ts/src/jdom/service";
import { jdpack } from "../../../jacdac-ts/src/jdom/pack";
import SoundPlayerServiceHost from "../../../jacdac-ts/src/hosts/soundplayerservicehost";
import { Howl } from 'howler';

function SoundButton(props: { service: JDService, name: string, duration: number }) {
    const { name, service } = props;
    const handleClick = async () => {
        await service.sendCmdAsync(SoundPlayerCmd.Play, jdpack("u0.16 s", [1, name]), false)
    }
    return <Button variant="outlined" onClick={handleClick}>{name}</Button>
}

export default function DashboardSoundPlayer(props: DashboardServiceProps) {
    const { service } = props;
    const volumeRegister = service.register(SoundPlayerReg.Volume);
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister)
    const host = useServiceHost<SoundPlayerServiceHost>(service);
    const color = host ? "secondary" : "primary";
    const sounds = useChangeAsync(service, async () => {
        const sounds = await service.receiveWithInPipe<[number, string]>(SoundPlayerCmd.ListSounds, "u32 s")
        return sounds;
    }, [service])
    const handleVolumeChange = async (ev: unknown, newValue: number | number[]) => {
        volumeRegister.sendSetPackedAsync("u0.16", [newValue], true);
    }
    useEffect(() => {
        if (host)
            host.onPlay = (vol: number, name: string) => {
                // Setup the new Howl.
                const sound = new Howl({
                    src: [`/jacdac-ts/sounds/${name}.wav`],
                    volume: vol * volume
                });
                sound.play();
            };
        return () => host.onPlay = undefined;
    }, [volume, host]);
    return <Grid container spacing={1}>
        {sounds?.map(sound => <Grid item key={sound[1]}>
            <SoundButton service={service} duration={sound[0]} name={sound[1]} />
        </Grid>)}
        {volume !== undefined && <Grid item xs={12}>
            <Slider
                valueLabelDisplay="off"
                min={0} max={1} step={0.05}
                aria-label="volume"
                value={volume}
                color={color}
                onChange={handleVolumeChange} />
        </Grid>}
    </Grid>
}