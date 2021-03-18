import React, { useEffect } from "react"
import { DashboardServiceProps } from "./DashboardServiceWidget"
import {
    useRegisterBoolValue,
    useRegisterUnpackedValue,
} from "../../jacdac/useRegisterValue"
import useServiceHost from "../hooks/useServiceHost"
import { Grid } from "@material-ui/core"
import MicIcon from "@material-ui/icons/Mic"
import {
    REFRESH,
    SoundSpectrumReg,
} from "../../../jacdac-ts/src/jdom/constants"
import useMicrophoneSpectrum from "../hooks/useMicrophoneSpectrum"
import IconButtonWithProgress from "../ui/IconButtonWithProgress"
import { JDService } from "../../../jacdac-ts/src/jdom/service"
import SensorServiceHost from "../../../jacdac-ts/src/hosts/sensorservicehost"
import BytesBarGraphWidget from "../widgets/BytesBarGraphWidget"

function HostMicrophoneButton(props: {
    service: JDService
    host?: SensorServiceHost<[Uint8Array]>
    visible: boolean
}) {
    const { host, service, visible } = props
    const enabledRegister = service.register(SoundSpectrumReg.Enabled)
    const enabled = useRegisterBoolValue(enabledRegister, props)
    const [minDecibels] = useRegisterUnpackedValue<[number]>(
        service.register(SoundSpectrumReg.MinDecibels),
        props
    )
    const [maxDecibels] = useRegisterUnpackedValue<[number]>(
        service.register(SoundSpectrumReg.MaxDecibels),
        props
    )
    const [fftPow2Size] = useRegisterUnpackedValue<[number]>(
        service.register(SoundSpectrumReg.FftPow2Size),
        props
    )
    const fftSize = 1 << (fftPow2Size || 5)
    const [smoothingTimeConstant] = useRegisterUnpackedValue<[number]>(
        service.register(SoundSpectrumReg.SmoothingTimeConstant),
        props
    )
    const { spectrum, onClickActivateMicrophone } = useMicrophoneSpectrum(
        enabled && !!host,
        {
            fftSize,
            smoothingTimeConstant,
            minDecibels,
            maxDecibels,
        }
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
            enabled &&
            host?.subscribe(REFRESH, () => {
                const v = spectrum?.()
                if (v !== undefined) {
                    host.reading.setValues([v], true)
                }
            }),
        [host, spectrum, visible]
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
    const frequencyBinsRegister = service.register(
        SoundSpectrumReg.FrequencyBins
    )
    const host = useServiceHost<SensorServiceHost<[Uint8Array]>>(service)

    return (
        <Grid container direction="column">
            <Grid item>
                <BytesBarGraphWidget visible={visible} register={frequencyBinsRegister} />
            </Grid>
            <Grid item>
                <HostMicrophoneButton
                    service={service}
                    host={host}
                    visible={visible}
                />
            </Grid>
        </Grid>
    )
}
