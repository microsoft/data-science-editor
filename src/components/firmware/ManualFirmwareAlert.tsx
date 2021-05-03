import { Box, Grid, MenuItem, Switch, Typography } from "@material-ui/core"
import React, { ChangeEvent, useContext, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import Alert from "../ui/Alert"
import useDevices from "../hooks/useDevices"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import SelectWithLabel from "../ui/SelectWithLabel"
import useFirmwareBlobs from "./useFirmwareBlobs"
import { FirmwareBlob } from "../../../jacdac-ts/src/jdom/flashing"
import DeviceActions from "../DeviceActions"
import { deviceSpecifications } from "../../../jacdac-ts/src/jdom/spec"
import { FlashDeviceButton } from "./FlashDeviceButton"

const fwid = (fw: FirmwareBlob) =>
    fw ? `${fw.store},${fw.firmwareIdentifier},${fw.version}` : ""

function ManualFirmware() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const devices = useDevices({
        announced: true,
        ignoreSelf: true,
        ignoreSimulators: true,
    })
    const firmwares = useFirmwareBlobs()
    const [deviceId, setDeviceId] = useState(devices?.[0]?.id)
    const [firmwareId, setFirmwareId] = useState<string>(fwid(firmwares?.[0]))
    const devSpecs = deviceSpecifications()

    const handleDeviceChange = (
        ev: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const id = ev.target.value as string
        setDeviceId(id)
    }
    const handleFirmwareChange = (
        ev: ChangeEvent<{ name?: string; value: unknown }>
    ) => {
        const id = ev.target.value as string
        setFirmwareId(id)
    }

    const device = bus.node(deviceId) as JDDevice
    const blob = firmwares.find(fw => fwid(fw) === firmwareId)

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SelectWithLabel
                    helperText="choose a device"
                    value={deviceId}
                    onChange={handleDeviceChange}
                >
                    {devices?.map(dev => (
                        <MenuItem key={dev.id} value={dev.id}>
                            {dev.describe()}
                        </MenuItem>
                    ))}
                </SelectWithLabel>
                {deviceId && (
                    <DeviceActions device={bus.node(deviceId) as JDDevice} />
                )}
            </Grid>
            <Grid item xs={12}>
                <SelectWithLabel
                    helperText="choose a firmware"
                    value={firmwareId}
                    onChange={handleFirmwareChange}
                >
                    {firmwares?.map(fw => (
                        <MenuItem key={fwid(fw)} value={fwid(fw)}>
                            {`0x${fw.firmwareIdentifier.toString(16)}`}, &nbsp;
                            {
                                devSpecs.find(
                                    ds =>
                                        ds.firmwares?.indexOf(
                                            fw.firmwareIdentifier
                                        ) > -1
                                )?.name
                            }
                            {fw.version}, &nbsp;
                            <Typography variant="caption">
                                {fw.store}
                            </Typography>
                        </MenuItem>
                    ))}
                </SelectWithLabel>
            </Grid>
            <Grid item xs={12}>
                <FlashDeviceButton
                    device={device}
                    blob={blob}
                    ignoreFirmwareInfoCheck={true}
                />
            </Grid>
        </Grid>
    )
}

export default function ManualFirmwareAlert() {
    const [enabled, setEnabled] = useState(false)
    const handleToggle = async () => {
        const v = !enabled
        setEnabled(v)
    }

    return (
        <>
            <Alert severity="info">
                <Switch value={enabled} onChange={handleToggle} />
                <Typography component="span" variant="body1">
                    manual mode
                </Typography>
                <Box mr={1}>
                    <Typography component="span" variant="caption">
                        Manually select which firmware to upload on your device.
                    </Typography>
                </Box>
            </Alert>
            {enabled && (
                <Alert severity="warning">
                    <ManualFirmware />
                </Alert>
            )}
        </>
    )
}
