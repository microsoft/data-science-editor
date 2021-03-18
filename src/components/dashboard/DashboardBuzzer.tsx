
import { Button, createStyles, Grid, makeStyles, Slider } from "@material-ui/core";
import React, { useEffect, useRef } from "react";
import { BuzzerCmd, BuzzerReg } from "../../../jacdac-ts/src/jdom/constants";
import { DashboardServiceProps } from "./DashboardServiceWidget";
import { jdpack } from "../../../jacdac-ts/src/jdom/pack";
import useKeyboardNavigationProps from "../hooks/useKeyboardNavigationProps";
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue";
import useServiceHost from "../hooks/useServiceHost";
import usePlayTone from "../hooks/usePlayTone";
import BuzzerServiceHost from "../../../jacdac-ts/src/hosts/buzzerservicehost";

const useStyles = makeStyles(() => createStyles({
    btn: {
        minWidth: "1em",
        padding: "1em 0.75em 1em 0.75em"
    }
}));

export default function DashboardBuzzer(props: DashboardServiceProps) {
    const { service } = props;
    const classes = useStyles();
    const gridRef = useRef<HTMLDivElement>();
    const host = useServiceHost<BuzzerServiceHost>(service);
    const color = host ? "secondary" : "primary";
    const volumeRegister = service.register(BuzzerReg.Volume);
    const [volume] = useRegisterUnpackedValue<[number]>(volumeRegister, props)
    const keyboardProps = useKeyboardNavigationProps(gridRef.current)
    const { playTone, setVolume, onClickActivateAudioContext } = usePlayTone(volume);

    // listen for playTone commands from the buzzer
    useEffect(() => host?.subscribe<[number, number]>(BuzzerServiceHost.PLAY_TONE, args => {
        playTone?.(args[0], args[1])
    }), [host]);

    const notes = [
        { name: "C", frequency: 261.64 },
        { name: "D", frequency: 293.68 },
        { name: "E", frequency: 329.64 },
        { name: "F", frequency: 349.24 },
        { name: "G", frequency: 392.00 },
        { name: "A", frequency: 440 },
        { name: "B", frequency: 493.92 },
    ];
    const sendPlayTone = async (f: number) => {
        if (host)
            onClickActivateAudioContext(); // enable audio context within click handler
        const vol = 1;
        const period = 1000000 / f;
        const duty = period * vol / 2;
        const duration = 400;
        const data = jdpack<[number, number, number]>("u16 u16 u16", [period, duty, duration])
        await service.sendCmdAsync(BuzzerCmd.PlayTone, data)
    }
    const handlePointerEnter = (f: number) => (ev: any) => {
        if (ev.buttons)
            sendPlayTone(f)
    }
    const handlePlayTone = (f: number) => () => sendPlayTone(f)
    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        volumeRegister.sendSetPackedAsync("u0.8", [newValue], true);
    }
    useEffect(() => setVolume(volume), [volume]);

    return <Grid ref={gridRef} container alignItems="center" alignContent="space-between">
        {notes.map(note => <Grid key={note.frequency} item xs><Button
            className={classes.btn}
            size="small"
            variant="outlined"
            onPointerEnter={handlePointerEnter(note.frequency)}
            onPointerDown={handlePlayTone(note.frequency)}
            {...keyboardProps}
        >{note.name}</Button>
        </Grid>)}
        {volume !== undefined && <Grid item xs={12}>
            <Slider
                valueLabelDisplay="off"
                min={0} max={1} step={0.05}
                aria-label="volume"
                value={volume}
                color={color}
                onChange={handleChange}
            />
        </Grid>}
    </Grid>
}
