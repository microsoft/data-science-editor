import { Grid, Slider } from "@mui/material"
import React from "react"
import {
    RegisterOptions,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { BuzzerServer } from "../../../jacdac-ts/src/servers/buzzerserver"
import VolumeDownIcon from "@mui/icons-material/VolumeDown"
import VolumeUpIcon from "@mui/icons-material/VolumeUp"
import { JDRegister } from "../../../jacdac-ts/src/jacdac"
import { IconButton } from "gatsby-theme-material-ui"

export default function VolumeWidget(
    props: { register: JDRegister } & RegisterOptions
) {
    const { register } = props
    const { service } = register
    const server = useServiceServer<BuzzerServer>(service)
    const color = server ? "secondary" : "primary"
    const [volume] = useRegisterUnpackedValue<[number]>(register, props)
    const handleChange = async (ev: unknown, newValue: number | number[]) => {
        await register.sendSetPackedAsync([newValue], true)
    }
    const handleVolumeDown = async () => {
        await register.sendSetPackedAsync([Math.max(0, volume - 0.1)], true)
    }
    const handleVolumeUp = async () => {
        await register.sendSetPackedAsync([Math.min(1, volume + 0.1)], true)
    }

    return (
        <Grid container spacing={2}>
            <Grid item>
                <IconButton onClick={handleVolumeDown}>
                    <VolumeDownIcon />
                </IconButton>
            </Grid>
            <Grid item xs>
                <Slider
                    valueLabelDisplay="off"
                    min={0}
                    max={1}
                    step={0.1}
                    aria-label="volume"
                    value={volume || 0}
                    color={color}
                    onChange={handleChange}
                    disabled={volume === undefined}
                />
            </Grid>
            <Grid item>
                <IconButton onClick={handleVolumeUp}>
                    <VolumeUpIcon />
                </IconButton>
            </Grid>
        </Grid>
    )
}
