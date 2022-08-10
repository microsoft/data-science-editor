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
import useBusWithMode from "../../jacdac/useBusWithMode"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import DeviceTestExporter from "../../components/testdom/DeviceTestExporter"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"

const FACTORY_MODE_STORAGE_KEY = "jacdac_device_tester_factory"

function DeviceItem(props: { device: JDDevice; factory?: boolean }) {
    const { device, factory } = props
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useChange(
        device,
        _ =>
            _ &&
            !_.firmwareUpdater &&
            ({
                productIdentifier,
                factory,
                services: device.serviceClasses
                    .filter(filterTestService)
                    .map(sc => ({ serviceClass: sc })),
            } as DeviceTestSpec),
        [productIdentifier, factory],
        (a, b) => JSON.stringify(a) === JSON.stringify(b)
    )
    const test = useDeviceTest(device, testSpec)
    if (!device) return null
    return <DeviceTestItem test={test} device={device} />
}

export const frontmatter = {
    title: "Device Tester",
    description:
        "Validating services in devices. Designed for manual or factory floor testing.",
}

export default function Page() {
    const [tab, setTab] = useState(0)
    const [proxy, setProxy] = useState(false)
    const [factory, setFactory] = useLocalStorage(
        FACTORY_MODE_STORAGE_KEY,
        false
    )

    // don't let a brain interfere
    useProxy(proxy)
    // auto-connect
    useBusWithMode({ autoConnect: true })

    const handleSetFactory = (checked: boolean) => setFactory(checked)
    const handleSetProxy = (checked: boolean) => setProxy(checked)
    const devices = useDevices({
        physical: !Flags.diagnostics,
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
                                <DeviceItem device={device} factory={factory} />
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
                    severity="success"
                    title="factory mode"
                    checked={factory}
                    onChecked={handleSetFactory}
                >
                    Tests should be fast and automated in factory mode. Manual
                    tests are <b>disabled</b>.
                    {factory && <DeviceTestExporter />}
                </AlertSwitch>
                <AlertSwitch
                    severity="info"
                    title="automatic dongle mode"
                    checked={proxy}
                    onChecked={handleSetProxy}
                >
                    Force brains to enter dongle mode, to avoid application
                    interfere with testing.
                </AlertSwitch>
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <FirmwareCardGrid />
                <SafeBootAlert />
                <ManualFirmwareAlert />
            </TabPanel>
        </>
    )
}
