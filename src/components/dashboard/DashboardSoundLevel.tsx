import React, { useEffect } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceHost from "../hooks/useServiceHost"
import { Grid, Slider } from "@material-ui/core"
import MicIcon from "@material-ui/icons/Mic"
import { REFRESH, SoundLevelReg } from "../../../jacdac-ts/src/jdom/constants"
import AnalogSensorServiceHost from "../../../jacdac-ts/src/hosts/analogsensorservicehost"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useMicrophoneVolume from "../hooks/useMicrophoneVolume"
import TrendWidget from "../widgets/TrendWidget"
import LoadingProgress from "../ui/LoadingProgress"

function HostMicrophoneButton(props: {
    service: JDService
    host?: AnalogSensorServiceHost
    visible: boolean
}) {
    const { host, service, visible } = props
    const enabledRegister = service.register(SoundLevelReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const [minDecibels] = useRegisterUnpackedValue<[number]>(
        service.register(SoundLevelReg.MinDecibels),
        props
    )
    const [maxDecibels] = useRegisterUnpackedValue<[number]>(
        service.register(SoundLevelReg.MaxDecibels),
        props
    )
    const { volume, onClickActivateMicrophone } = useMicrophoneVolume(
        enabled && !!host,
        { fftSize: 64, smoothingTimeConstant: 0, minDecibels, maxDecibels }
    )
    const title = enabled ? "Stop microphone" : "Start microphone"

    const handleClick = async () => {
        if (!enabled) await onClickActivateMicrophone()
        await enabledRegister.sendSetBoolAsync(!enabled, true)
    }

    // update volume on demand
    useEffect(
        () =>
            visible &&
            host?.subscribe(REFRESH, () => {
                const v = volume?.()
                if (v !== undefined) {
                    host.reading.setValues([v])
                }
            }),
        [host, volume, visible]
    )

    return (
        <IconButtonWithProgress
            aria-label={title}
            title={title}
            indeterminate={enabled}
            onClick={handleClick}
        >
            <MicIcon />
        </IconButtonWithProgress>
    )
}

export default function DashboardSoundLevel(props: DashboardServiceProps) {
    const { visible, service } = props
    const soundLevelRegister = service.register(SoundLevelReg.SoundLevel)
    const [soundLevel] = useRegisterUnpackedValue<[number]>(
        soundLevelRegister,
        props
    )
    const host = useServiceHost<AnalogSensorServiceHost>(service)
    const color = host ? "secondary" : "primary"

    const onChange = (event: unknown, newValue: number | number[]): void => {
        const svalue = newValue as number
        host?.reading.setValues([svalue])
        soundLevelRegister.sendGetAsync() // refresh
    }

    if (soundLevel === undefined) return <LoadingProgress />

    return (
        <Grid container direction="column">
            <Grid item>
                <TrendWidget
                    register={soundLevelRegister}
                    min={0}
                    max={1}
                    horizon={64}
                />
            </Grid>
            <Grid item>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <HostMicrophoneButton
                            service={service}
                            host={host}
                            visible={visible}
                        />
                    </Grid>
                    <Grid item xs>
                        <Slider
                            disabled={!host}
                            valueLabelDisplay="off"
                            min={0}
                            max={1}
                            step={0.1}
                            value={soundLevel}
                            onChange={onChange}
                            color={color}
                        />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
