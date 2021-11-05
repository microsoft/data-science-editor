import { ControlReg } from "../../../jacdac-ts/src/jdom/constants"
import { CardHeader, Chip, Grid, Typography } from "@mui/material"
// tslint:disable-next-line: no-submodule-imports
import { Link } from "gatsby-theme-material-ui"
import JDDevice from "../../../jacdac-ts/src/jdom/device"
import React from "react"
import { useRegisterUnpackedValue } from "../../jacdac/useRegisterValue"
import DeviceActions from "./DeviceActions"
import DeviceName from "./DeviceName"
import DeviceCardMedia from "./DeviceCardMedia"
import useDeviceSpecification from "../../jacdac/useDeviceSpecification"
import { identifierToUrlPath } from "../../../jacdac-ts/src/jdom/spec"
import DeviceAvatar from "./DeviceAvatar"
import useChange from "../../jacdac/useChange"
import Flags from "../../../jacdac-ts/src/jdom/flags"

function DeviceProductIdentifierChip(props: { device: JDDevice }) {
    const { device } = props
    const register = useChange(device, _ =>
        _?.service(0)?.register(ControlReg.ProductIdentifier)
    )
    const [productIdentifier] = useRegisterUnpackedValue<[number]>(register)
    if (isNaN(productIdentifier)) return null

    return (
        <Chip size="small" label={`pid: 0x${productIdentifier.toString(16)}`} />
    )
}

function DeviceFirmwareVersionChip(props: { device: JDDevice }) {
    const { device } = props
    const firmwareVersionRegister = useChange(device, _ =>
        _?.service(0)?.register(ControlReg.FirmwareVersion)
    )
    const [firmwareVersion] = useRegisterUnpackedValue<[string]>(
        firmwareVersionRegister
    )
    if (!firmwareVersion) return null

    return <Chip size="small" label={firmwareVersion} />
}

function DeviceTemperatureChip(props: { device: JDDevice }) {
    const { device } = props
    const tempRegister = useChange(device, _ =>
        _?.service(0)?.register(ControlReg.McuTemperature)
    )
    const [temperature] = useRegisterUnpackedValue<[number]>(tempRegister)
    if (isNaN(temperature)) return null
    return <Chip size="small" label={`${temperature}°`} />
}

export default function DeviceCardHeader(props: {
    device: JDDevice
    showAvatar?: boolean
    showDeviceId?: boolean
    showFirmware?: boolean
    showTemperature?: boolean
    showMedia?: boolean
    showSettings?: boolean
    showReset?: boolean
}) {
    const {
        device,
        showFirmware,
        showTemperature,
        showMedia,
        showDeviceId,
        showAvatar,
        showSettings,
        showReset,
    } = props
    const specification = useDeviceSpecification(device)

    return (
        <>
            {showMedia && <DeviceCardMedia device={device} />}
            <CardHeader
                avatar={showAvatar && <DeviceAvatar device={device} />}
                action={
                    <DeviceActions
                        device={device}
                        showReset={showReset}
                        showSettings={showSettings}
                        hideIdentity={showAvatar}
                    />
                }
                title={
                    <Link
                        color="textPrimary"
                        underline="hover"
                        to={`/devices/${
                            identifierToUrlPath(specification?.id) || ""
                        }`}
                    >
                        <DeviceName device={device} />
                    </Link>
                }
                subheader={
                    <Grid container spacing={1}>
                        <Grid item>
                            <Typography variant="caption" gutterBottom>
                                {[
                                    specification?.name,
                                    showDeviceId && device.deviceId,
                                ]
                                    .filter(s => !!s)
                                    .join(", ")}
                            </Typography>
                        </Grid>
                        {showFirmware && Flags.diagnostics && (
                            <Grid item>
                                <DeviceProductIdentifierChip device={device} />
                            </Grid>
                        )}
                        {showFirmware && (
                            <Grid item>
                                <DeviceFirmwareVersionChip device={device} />
                            </Grid>
                        )}
                        {showTemperature && (
                            <Grid item>
                                <DeviceTemperatureChip device={device} />
                            </Grid>
                        )}
                    </Grid>
                }
            />
        </>
    )
}
