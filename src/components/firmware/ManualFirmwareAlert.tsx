import { Grid, MenuItem, SelectChangeEvent, Typography } from "@mui/material"
import React, { useContext, useState } from "react"
// tslint:disable-next-line: no-submodule-imports
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import Alert from "../ui/Alert"
import useBus from "../../jacdac/useBus"
import useDevices from "../hooks/useDevices"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import SelectWithLabel from "../ui/SelectWithLabel"
import { FirmwareBlob } from "../../../jacdac-ts/src/jdom/flashing"
import { FlashDeviceButton } from "./FlashDeviceButton"
import { unique } from "../../../jacdac-ts/src/jdom/utils"
import SelectDevice from "../select/SelectDevice"
import useChange from "../../jacdac/useChange"
import AlertSwitch from "../ui/AlertSwitch"

const fwid = (fw: FirmwareBlob) =>
    fw ? `${fw.store},${fw.productIdentifier},${fw.version}` : ""

function ManualFirmware() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const devices = useDevices({
        announced: true,
        ignoreInfrastructure: true,
        ignoreSimulators: true,
    })
    const firmwares = useChange(bus, _ => _?.firmwareBlobs)
    const stores = unique(firmwares.map(fw => fw.store))
    const [deviceId, setDeviceId] = useState(devices?.[0]?.id)
    const [firmwareId, setFirmwareId] = useState<string>(fwid(firmwares?.[0]))
    const [store, setStore] = useState<string>(stores?.[0] || "")

    const handleDeviceChange = (newId: string) => setDeviceId(newId)
    const handleStoreChange = (ev: SelectChangeEvent<string>) => {
        const store = ev.target.value
        setStore(store)
    }
    const handleFirmwareChange = (ev: SelectChangeEvent<string>) => {
        const id = ev.target.value
        setFirmwareId(id)
    }

    const device = bus.node(deviceId) as JDDevice
    const blob = firmwares.find(fw => fwid(fw) === firmwareId)

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <SelectDevice
                    devices={devices}
                    deviceId={deviceId}
                    onChange={handleDeviceChange}
                />
            </Grid>
            <Grid item xs={12}>
                <Grid container direction="row" spacing={1}>
                    <Grid item>
                        <SelectWithLabel
                            helperText="choose a firmware"
                            value={store}
                            onChange={handleStoreChange}
                        >
                            {stores?.map(store => (
                                <MenuItem key={store} value={store}>
                                    {store}
                                </MenuItem>
                            ))}
                        </SelectWithLabel>
                    </Grid>
                    <Grid item>
                        <SelectWithLabel
                            helperText="choose a module"
                            value={firmwareId}
                            onChange={handleFirmwareChange}
                        >
                            {firmwares
                                ?.filter(fw => fw.store === store)
                                .map(fw => (
                                    <MenuItem key={fwid(fw)} value={fwid(fw)}>
                                        {fw.name} &nbsp;
                                        <Typography variant="caption">
                                            {fw.version}, &nbsp;
                                            {`0x${fw.productIdentifier.toString(
                                                16
                                            )}`}
                                        </Typography>
                                    </MenuItem>
                                ))}
                        </SelectWithLabel>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <FlashDeviceButton
                    device={device}
                    blob={blob}
                    ignoreFirmwareCheck={true}
                />
            </Grid>
        </Grid>
    )
}

export default function ManualFirmwareAlert() {
    const bus = useBus()
    const safeBoot = useChange(bus, _ => _.safeBoot)
    const [enabled, setEnabled] = useState(false)
    const handleToggle = async () => {
        const v = !enabled
        setEnabled(v)
    }

    if (!safeBoot) return null

    return (
        <>
            <AlertSwitch
                severity="info"
                checked={enabled}
                onChecked={handleToggle}
                title="manual mode"
            >
                Manually select which firmware to upload on your device.
            </AlertSwitch>
            {enabled && (
                <Alert severity="warning">
                    <ManualFirmware />
                </Alert>
            )}
        </>
    )
}
