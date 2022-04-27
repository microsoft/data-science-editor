import { Grid, Tab, Tabs } from "@mui/material"
import React, { useState } from "react"
import useDevices from "../../components/hooks/useDevices"
import useDeviceProductIdentifier from "../../jacdac/useDeviceProductIdentifier"
import FirmwareLoader from "../../components/firmware/FirmwareLoader"
import FirmwareCardGrid from "../../components/firmware/FirmwareCardGrid"
import useChange from "../../jacdac/useChange"
import {
    filterTestDevice,
    filterTestService,
} from "../../components/testdom/filters"
import DeviceTestItem from "../../components/testdom/DeviceTestItem"
import { DeviceTestSpec } from "../../../jacdac-ts/src/testdom/spec"
import useDeviceTest from "../../components/testdom/useDeviceTest"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import SafeBootAlert from "../../components/firmware/SafeBootAlert"
import ManualFirmwareAlert from "../../components/firmware/ManualFirmwareAlert"
import { isDualDeviceId } from "../../../jacdac-ts/src/jdom/spec"
import PowerSupplySection from "../../components/testdom/PowerSupplySection"
import TabPanel from "../../components/ui/TabPanel"
import AlertSwitch from "../../components/ui/AlertSwitch"
import useProxy from "../../jacdac/useProxy"

function DeviceItem(props: { device: JDDevice; factory?: boolean, autoUpdate?: boolean }) {
    const { device, factory, autoUpdate } = props
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useChange(
        device,
        _ =>
            _ &&
            !_.firmwareUpdater &&
            productIdentifier &&
            ({
                productIdentifier,
                factory,
                services: device.serviceClasses
                    .filter(filterTestService)
                    .map(sc => ({ serviceClass: sc })),
            } as DeviceTestSpec),
        [productIdentifier, factory]
    )
    const test = useDeviceTest(device, testSpec)
    if (!device) return null
    return (
        <DeviceTestItem test={test} device={device} autoUpdate={autoUpdate} />
    )
}

export default function Page() {
    const [tab, setTab] = useState(0)
    const [autoUpdate, setAutoUpdate] = useState(false)
    const [factory, setFactory] = useState(false)

    // don't let a brain interfere
    useProxy(true)

    const handleSetFactory = (checked: boolean) => setFactory(checked)
    const devices = useDevices({
        physical: true,
        announced: true,
        ignoreInfrastructure: true,
    })
        .filter(
            (dev, _, devs) =>
                !dev.bootloader || // show non-bootloader devices
                !devs.some(d => isDualDeviceId(d.deviceId, dev.deviceId)) // show bootloaders which don't have the application device listed
        )
        .filter(filterTestDevice)
        .sort((l, r) => -(l.created - r.created))
    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }
    const handleAutoUpdateChange = checked => setAutoUpdate(checked)

    return (
        <>
            <FirmwareLoader />
            <h1>Device Tester</h1>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="Testing services in devices"
            >
                <Tab label={`Devices`} />
                <Tab label={`Firmwares`} />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <PowerSupplySection />
                {devices?.length ? (
                    <Grid container spacing={1}>
                        {devices?.map(device => (
                            <Grid key={device.id} item xs={12}>
                                <DeviceItem
                                    device={device}
                                    factory={factory}
                                    autoUpdate={autoUpdate}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <p>
                        Connect your device and follow the instructions to run a
                        compliance test.
                    </p>
                )}
                <AlertSwitch
                    severity="info"
                    title="factory mode"
                    checked={factory}
                    onChecked={handleSetFactory}
                >
                    Tests should be fast and automated in factory mode. Manual
                    tests are disabled.
                </AlertSwitch>
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <FirmwareCardGrid />
                <AlertSwitch
                    severity="warning"
                    checked={autoUpdate}
                    onChecked={handleAutoUpdateChange}
                    title="auto firmware update"
                >
                    Start firmware updates automatically when available.
                </AlertSwitch>
                <SafeBootAlert />
                <ManualFirmwareAlert />
            </TabPanel>
        </>
    )
}
