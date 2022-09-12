import React, { useEffect } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { Grid } from "@mui/material"
import MicIcon from "@mui/icons-material/Mic"
import { REFRESH, SoundLevelReg } from "../../../jacdac-ts/src/jdom/constants"
import { AnalogSensorServer } from "../../../jacdac-ts/src/servers/analogsensorserver"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import useMicrophoneVolume from "../hooks/useMicrophoneVolume"
import TrendWidget from "../widgets/TrendWidget"
import useRegister from "../hooks/useRegister"
import MicrophoneSettingsButton from "../ui/MicrophoneSettingsButton"
import Suspense from "../ui/Suspense"
import GaugeWidget from "../widgets/GaugeWidget"

function HostMicrophoneButton(props: {
    service: JDService
    server?: AnalogSensorServer
    visible: boolean
}) {
    const { server, service, visible } = props

    const enabledRegister = useRegister(service, SoundLevelReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const { volume, onClickActivateMicrophone } = useMicrophoneVolume(
        enabled && !!server,
        { fftSize: 64, smoothingTimeConstant: 0 }
    )
    const title = enabled ? "Stop microphone" : "Start microphone"

    const handleClick = async () => {
        if (!enabled && server) await onClickActivateMicrophone()
        await enabledRegister.sendSetBoolAsync(!enabled, true)
    }

    // update volume on demand
    useEffect(
        () =>
            visible
                ? server?.subscribe(REFRESH, () => {
                      const v = volume?.()
                      if (v !== undefined) {
                          server.reading.setValues([v])
                      }
                  })
                : undefined,
        [server, volume, visible]
    )

    return (
        <IconButtonWithProgress
            title={title}
            indeterminate={enabled}
            onClick={handleClick}
        >
            <MicIcon />
        </IconButtonWithProgress>
    )
}

export default function DashboardSoundLevel(props: DashboardServiceProps) {
    const { visible, expanded, service } = props
    const soundLevelRegister = useRegister(service, SoundLevelReg.SoundLevel)
    const server = useServiceServer<AnalogSensorServer>(service)
    const [soundLevel] = useRegisterUnpackedValue<[number]>(
        soundLevelRegister,
        props
    )
    const color = server ? "secondary" : "primary"
    const size = `clamp(6rem, 12vw, 12vh)`

    return (
        <Grid container direction="column">
            {expanded && (
                <Grid item>
                    <TrendWidget
                        register={soundLevelRegister}
                        min={0}
                        max={1}
                        horizon={32}
                    />
                </Grid>
            )}
            {!expanded && soundLevel !== undefined && (
                <Grid item>
                    <Suspense>
                        <GaugeWidget
                            value={Math.ceil(soundLevel * 100)}
                            min={0}
                            max={100}
                            size={size}
                            color={color}
                        />
                    </Suspense>
                </Grid>
            )}
            <Grid item>
                <Grid container spacing={1}>
                    <Grid item>
                        <HostMicrophoneButton
                            service={service}
                            server={server}
                            visible={visible}
                        />
                    </Grid>
                    {server && (
                        <Grid item>
                            <MicrophoneSettingsButton />
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </Grid>
    )
}
