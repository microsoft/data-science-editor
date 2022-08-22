import { Grid, Tab, Tabs } from "@mui/material"
import React, { useMemo, useState } from "react"
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
import {
    DeviceTestSpec,
    OracleTestSpec,
} from "../../../jacdac-ts/src/testdom/spec"
import useDeviceTest from "../../components/testdom/useDeviceTest"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { isDualDeviceId } from "../../../jacdac-ts/src/jdom/spec"
import PowerSupplySection from "../../components/testdom/PowerSupplySection"
import TabPanel from "../../components/ui/TabPanel"
import AlertSwitch from "../../components/ui/AlertSwitch"
import useProxy from "../../jacdac/useProxy"
import useBusWithMode from "../../jacdac/useBusWithMode"
import useLocalStorage from "../../components/hooks/useLocalStorage"
import DeviceTestExporter from "../../components/testdom/DeviceTestExporter"
import { Flags } from "../../../jacdac-ts/src/jdom/flags"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import SwitchWithLabel from "../../components/ui/SwitchWithLabel"
import { arrayConcatMany, splitFilter } from "../../../jacdac-ts/src/jdom/utils"
import { resolveReadingTolerage } from "../../../jacdac-ts/src/testdom/testrules"
import GridHeader from "../../components/ui/GridHeader"

const FACTORY_MODE_STORAGE_KEY = "device_tester_factory"
const EXPORT_MODE_STORAGE_KEY = "device_tester_export"
const ORACLE_DEVICES_STORAGE_KEY = "device_tester_oracles"

function DeviceItem(props: {
    device: JDDevice
    factory?: boolean
    oracles?: OracleTestSpec[]
}) {
    const { device, factory, oracles } = props
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
    const test = useDeviceTest(device, testSpec, oracles)
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
    const [exporter, setExporter] = useLocalStorage(
        EXPORT_MODE_STORAGE_KEY,
        false
    )
    const [oracleDeviceIds, setOracleDeviceIds] = useLocalStorage<string[]>(
        ORACLE_DEVICES_STORAGE_KEY,
        []
    )

    // don't let a brain interfere
    useProxy(proxy)
    // auto-connect
    useBusWithMode({ autoConnect: true })

    const handleSetFactory = (checked: boolean) => setFactory(checked)
    const handleSetExporter = (checked: boolean) => setExporter(checked)
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

    const [deviceOracles, devicesNoOracles] = splitFilter(devices, d =>
        oracleDeviceIds.includes(d.deviceId)
    )
    const oracles = useMemo(
        () =>
            arrayConcatMany(
                devices
                    ?.filter(d => oracleDeviceIds.includes(d.deviceId))
                    .map(d =>
                        d
                            .services({ sensor: true })
                            .map<OracleTestSpec>(
                                ({ device, serviceClass, serviceIndex }) => ({
                                    deviceId: device.deviceId,
                                    serviceClass,
                                    serviceIndex,
                                    tolerance:
                                        resolveReadingTolerage(serviceClass),
                                })
                            )
                    )
            ),
        [devices, oracleDeviceIds]
    )

    const handleTabChange = (
        event: React.ChangeEvent<unknown>,
        newValue: number
    ) => {
        setTab(newValue)
    }
    const handleCheckOracle = (device: JDDevice) => () => {
        const newOracles = oracleDeviceIds.slice(0)
        const i = newOracles.indexOf(device.deviceId)
        if (i > -1) newOracles.splice(i, 1)
        else newOracles.push(device.deviceId)
        setOracleDeviceIds(newOracles)
    }

    return (
        <>
            <h1>Device Tester</h1>
            <Tabs
                value={tab}
                onChange={handleTabChange}
                aria-label="Testing services in devices"
            >
                <Tab label={`Devices`} />
                <Tab label={`Oracles`} />
            </Tabs>
            <TabPanel value={tab} index={0}>
                <PowerSupplySection />
                {devicesNoOracles?.length ? (
                    <Grid container spacing={1}>
                        {devicesNoOracles?.map(device => (
                            <Grid key={device.id} item xs={12}>
                                <DeviceItem
                                    device={device}
                                    factory={factory}
                                    oracles={oracles}
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
                {!!deviceOracles?.length && (
                    <Grid container spacing={1}>
                        <GridHeader title="Oracles" />
                        {deviceOracles.map(d => (
                            <DashboardDeviceItem
                                device={d}
                                key={d.id}
                                showAvatar={true}
                                showHeader={true}
                                showReset={true}
                            />
                        ))}
                    </Grid>
                )}
                <AlertSwitch
                    severity="success"
                    title="factory mode"
                    checked={factory}
                    onChecked={handleSetFactory}
                >
                    Tests should be fast and automated in factory mode. Manual
                    tests are <b>disabled</b>.
                </AlertSwitch>
                <AlertSwitch
                    severity="info"
                    title="upload test results"
                    checked={exporter}
                    onChecked={handleSetExporter}
                >
                    Automatically upload test results to a web service.
                    {exporter && <DeviceTestExporter />}
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
                <Grid container spacing={1}>
                    <Grid item xs={12}>
                        Use known device readings as oracles for the device
                        under tests (within tolerance).
                    </Grid>
                    {devices?.map(device => (
                        <Grid key={device.id} item xs={12}>
                            <Grid container spacing={1}>
                                <DashboardDeviceItem
                                    key={device.id}
                                    device={device}
                                    showAvatar={true}
                                    showHeader={true}
                                    showReset={true}
                                />
                                <Grid item xs>
                                    <SwitchWithLabel
                                        label={"reading oracle"}
                                        checked={oracleDeviceIds.includes(
                                            device.deviceId
                                        )}
                                        onChange={handleCheckOracle(device)}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>
            </TabPanel>
        </>
    )
}
