import React, { useEffect } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { Grid, Slider } from "@material-ui/core"
import MicIcon from "@material-ui/icons/Mic"
import { REFRESH, SoundLevelReg } from "../../../jacdac-ts/src/jdom/constants"
import AnalogSensorServer from "../../../jacdac-ts/src/servers/analogsensorserver"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useMicrophoneVolume from "../hooks/useMicrophoneVolume"
import TrendWidget from "../widgets/TrendWidget"
import LoadingProgress from "../ui/LoadingProgress"
import useRegister from "../hooks/useRegister"

function HostMicrophoneButton(props: {
    service: JDService
    server?: AnalogSensorServer
    visible: boolean
}) {
    const { server, service, visible } = props

    const enabledRegister = useRegister(service, SoundLevelReg.Enabled)
    const minDecibelsRegister = useRegister(service, SoundLevelReg.MinDecibels)
    const maxDecibelsRegister = useRegister(service, SoundLevelReg.MaxDecibels)

    const enabled = useRegisterBoolValue(enabledRegister, props)
    const [minDecibels] = useRegisterUnpackedValue<[number]>(
        minDecibelsRegister,
        props
    )
    const [maxDecibels] = useRegisterUnpackedValue<[number]>(
        maxDecibelsRegister,
        props
    )
    const { volume, onClickActivateMicrophone } = useMicrophoneVolume(
        enabled && !!server,
        { fftSize: 64, smoothingTimeConstant: 0, minDecibels, maxDecibels }
    )
    const title = enabled ? "Stop microphone" : "Start microphone"

    const handleClick = async () => {
        if (!enabled && server) await onClickActivateMicrophone()
        await enabledRegister.sendSetBoolAsync(!enabled, true)
    }

    // update volume on demand
    useEffect(
        () =>
            visible &&
            server?.subscribe(REFRESH, () => {
                const v = volume?.()
                if (v !== undefined) {
                    server.reading.setValues([v])
                }
            }),
        [server, volume, visible]
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
    const soundLevelRegister = useRegister(service, SoundLevelReg.SoundLevel)
    const [soundLevel] = useRegisterUnpackedValue<[number]>(
        soundLevelRegister,
        props
    )
    const server = useServiceServer<AnalogSensorServer>(service)
    const color = server ? "secondary" : "primary"

    const onChange = (event: unknown, newValue: number | number[]): void => {
        const svalue = newValue as number
        server?.reading.setValues([svalue])
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
                            server={server}
                            visible={visible}
                        />
                    </Grid>
                    <Grid item xs>
                        <Slider
                            disabled={!server}
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
