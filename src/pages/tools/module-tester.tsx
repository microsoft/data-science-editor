import { Grid } from "@mui/material"
import React from "react"
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

function DeviceItem(props: { device: JDDevice }) {
    const { device } = props
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useChange(
        device,
        _ =>
            _ &&
            !_.flashing &&
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
    const devices = useDevices({
        physical: true,
        announced: true,
        ignoreInfrastructure: true,
    })
        .filter(filterTestDevice)
        .sort((l, r) => -(l.created - r.created))
    return (
        <>
            <FirmwareLoader />
            <h1>Module Tester</h1>
            <p>Only the last connected module is shown on this view.</p>
            <Grid container spacing={1}>
                {devices?.map(device => (
                    <Grid key={device.id} item xs={12}>
                        <DeviceItem device={device} />
                    </Grid>
                ))}
            </Grid>
            <h2>Firmwares</h2>
            <FirmwareCardGrid />
        </>
    )
}
