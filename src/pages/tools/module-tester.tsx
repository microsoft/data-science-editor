import { Grid } from "@mui/material"
import React from "react"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import useDevices from "../../components/hooks/useDevices"
import usePanelTest from "../../components/testdom/usePanelTest"
import useDeviceProductIdentifier from "../../jacdac/useDeviceProductIdentifier"
import PanelTestTreeView from "../../components/testdom/PanelTestTreeView"
import FirmwareLoader from "../../components/firmware/FirmwareLoader"
import FirmwareCardGrid from "../../components/firmware/FirmwareCardGrid"
import { JDDevice } from "../../../jacdac-ts/src/jdom/device"
import { PanelTest } from "../../../jacdac-ts/src/testdom/nodes"
import { FlashDeviceButton } from "../../components/firmware/FlashDeviceButton"
import useDeviceFirmwareBlob from "../../components/firmware/useDeviceFirmwareBlob"
import useChange from "../../jacdac/useChange"
import {
    filterTestDevice,
    filterTestService,
} from "../../components/testdom/filters"

function DeviceTestItem(props: { test: PanelTest; device: JDDevice }) {
    const { device, test } = props
    const blob = useDeviceFirmwareBlob(device)
    return (
        <>
            <DashboardDeviceItem
                key={device.id}
                device={device}
                showAvatar={true}
                showHeader={true}
            />
            <Grid item xs>
                <Grid container direction="column" spacing={1}>
                    {blob && (
                        <Grid item>
                            <FlashDeviceButton
                                device={device}
                                blob={blob}
                                hideUpToDate={true}
                                autoStart={true}
                            />
                        </Grid>
                    )}
                    {test && (
                        <Grid item xs={12}>
                            <PanelTestTreeView
                                panel={test}
                                skipPanel={true}
                                defaultExpanded={true}
                            />
                        </Grid>
                    )}
                </Grid>
            </Grid>
        </>
    )
}

export default function Page() {
    const devices = useDevices({
        physical: true,
        announced: true,
        ignoreInfrastructure: true,
    })
        .filter(filterTestDevice)
        .sort((l, r) => -(l.created - r.created))
    const device = devices[0]
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useChange(
        device,
        _ =>
            _ &&
            !_.flashing &&
            productIdentifier && {
                devices: [
                    {
                        productIdentifier,
                        count: 1,
                        services: device.serviceClasses
                            .filter(filterTestService)
                            .map(sc => ({ serviceClass: sc })),
                    },
                ],
            },
        [productIdentifier]
    )
    const test = usePanelTest(testSpec)

    return (
        <>
            <FirmwareLoader />
            <h1>Module Tester</h1>
            <p>Only the last connected module is shown on this view.</p>
            <Grid container spacing={1}>
                {device && <DeviceTestItem test={test} device={device} />}
            </Grid>
            <h3>Firmwares</h3>
            <FirmwareCardGrid />
        </>
    )
}
