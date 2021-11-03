import React, { useEffect } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceServer from "../hooks/useServiceServer"
import { Grid } from "@mui/material"
import MicIcon from "@mui/icons-material/Mic"
import {
    REFRESH,
    SoundSpectrumReg,
} from "../../../jacdac-ts/src/jdom/constants"
import useMicrophoneSpectrum from "../hooks/useMicrophoneSpectrum"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import JDService from "../../../jacdac-ts/src/jdom/service"
import SensorServer from "../../../jacdac-ts/src/servers/sensorserver"
import BytesBarGraphWidget from "../widgets/BytesBarGraphWidget"
import useRegister from "../hooks/useRegister"

function HostMicrophoneButton(props: {
    service: JDService
    server?: SensorServer<[Uint8Array]>
    visible: boolean
}) {
    const { server, service, visible } = props

    const enabledRegister = useRegister(service, SoundSpectrumReg.Enabled)
    const minDecibelsRegister = useRegister(
        service,
        SoundSpectrumReg.MinDecibels
    )
    const maxDecibelsRegister = useRegister(
        service,
        SoundSpectrumReg.MaxDecibels
    )
    const fftPow2SizeRegister = useRegister(
        service,
        SoundSpectrumReg.FftPow2Size
    )
    const smoothingTimeConstantRegister = useRegister(
        service,
        SoundSpectrumReg.SmoothingTimeConstant
    )

    const enabled = useRegisterBoolValue(enabledRegister, props)
    const [minDecibels] = useRegisterUnpackedValue<[number]>(
        minDecibelsRegister,
        props
    )
    const [maxDecibels] = useRegisterUnpackedValue<[number]>(
        maxDecibelsRegister,
        props
    )
    const [fftPow2Size] = useRegisterUnpackedValue<[number]>(
        fftPow2SizeRegister,
        props
    )
    const fftSize = 1 << (fftPow2Size || 5)
    const [smoothingTimeConstant] = useRegisterUnpackedValue<[number]>(
        smoothingTimeConstantRegister,
        props
    )
    const { spectrum, onClickActivateMicrophone } = useMicrophoneSpectrum(
        enabled && !!server,
        {
            fftSize,
            smoothingTimeConstant,
            minDecibels,
            maxDecibels,
        }
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
            enabled &&
            server?.subscribe(REFRESH, () => {
                const v = spectrum?.()
                if (v !== undefined) {
                    server.reading.setValues([v], true)
                }
            }),
        [server, spectrum, visible]
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

export default function DashboardSoundSpectrum(props: DashboardServiceProps) {
    const { service, visible } = props
    const frequencyBinsRegister = useRegister(
        service,
        SoundSpectrumReg.FrequencyBins
    )
    const server = useServiceServer<SensorServer<[Uint8Array]>>(service)

    return (
        <Grid container direction="column">
            <Grid item>
                <BytesBarGraphWidget
                    visible={visible}
                    register={frequencyBinsRegister}
                />
            </Grid>
            <Grid item>
                <HostMicrophoneButton
                    service={service}
                    server={server}
                    visible={visible}
                />
            </Grid>
        </Grid>
    )
}
