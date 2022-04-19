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
import ConnectAlert from "../../components/alert/ConnectAlert"
import TabPanel from "../../components/ui/TabPanel"

function DeviceItem(props: { device: JDDevice }) {
    const { device } = props
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useChange(
        device,
        _ =>
            _ &&
            !_.firmwareUpdater &&
            productIdentifier &&
            ({
                productIdentifier,
                services: device.serviceClasses
                    .filter(filterTestService)
                    .map(sc => ({ serviceClass: sc })),
            } as DeviceTestSpec),
        [productIdentifier]
    )
    const test = useDeviceTest(device, testSpec)
    if (!device) return null
    return <DeviceTestItem test={test} device={device} />
}

export default function Page() {
    const [tab, setTab] = useState(0)
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

    return (
        <>
            <FirmwareLoader />
            <h1>Server Tester</h1>
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
                                <DeviceItem device={device} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <>
                        <p>
                            Connect your module and follow the instructions to
                            run a compliance test.
                        </p>
                        <ConnectAlert />
                    </>
                )}
            </TabPanel>
            <TabPanel value={tab} index={1}>
                <FirmwareCardGrid />
                <SafeBootAlert />
                <ManualFirmwareAlert />
            </TabPanel>
        </>
    )
}
