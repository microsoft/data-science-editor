import { Grid } from "@mui/material"
import { PanelTestSpec } from "../../../jacdac-ts/src/jdom/testdom"
import React, { useMemo } from "react"
import DashboardDeviceItem from "../../components/dashboard/DashboardDeviceItem"
import useDevices from "../../components/hooks/useDevices"
import usePanelTest from "../../components/testdom/usePanelTest"
import useDeviceProductIdentifier from "../../jacdac/useDeviceProductIdentifier"
import {
    SRV_BOOTLOADER,
    SRV_BRIDGE,
    SRV_CONTROL,
    SRV_DASHBOARD,
    SRV_INFRASTRUCTURE,
    SRV_JACSCRIPT_CLOUD,
    SRV_JACSCRIPT_CONDITION,
    SRV_LOGGER,
    SRV_PROTO_TEST,
    SRV_PROXY,
    SRV_ROLE_MANAGER,
    SRV_SETTINGS,
    SRV_UNIQUE_BRAIN,
} from "../../../jacdac-ts/src/jdom/constants"
import PanelTestTreeView from "../../components/testdom/PanelTestTreeView"

const ignoredServices = [
    SRV_CONTROL,
    SRV_ROLE_MANAGER,
    SRV_LOGGER,
    SRV_SETTINGS,
    SRV_BOOTLOADER,
    SRV_PROTO_TEST,
    SRV_INFRASTRUCTURE,
    SRV_PROXY,
    SRV_UNIQUE_BRAIN,
    SRV_DASHBOARD,
    SRV_BRIDGE,
    SRV_JACSCRIPT_CLOUD,
    SRV_JACSCRIPT_CONDITION,
]

export default function Page() {
    const devices = useDevices({
        physical: true,
        announced: true,
        ignoreInfrastructure: true,
    }).sort((l, r) => -(l.created - r.created))
    const device = devices[0]
    const productIdentifier = useDeviceProductIdentifier(device)
    const testSpec = useMemo<PanelTestSpec>(
        () =>
            device &&
            productIdentifier && {
                devices: [
                    {
                        productIdentifier,
                        count: 1,
                        services: device.serviceClasses
                            .filter(sc => ignoredServices.indexOf(sc) < 0)
                            .map(sc => ({ serviceClass: sc })),
                    },
                ],
            },
        [device, productIdentifier]
    )
    const test = usePanelTest(testSpec)

    return (
        <>
            <h1>Module Tester</h1>
            <p>Only the last connected module is shown on this view.</p>
            <Grid container spacing={1}>
                {device && (
                    <DashboardDeviceItem
                        key={device.id}
                        device={device}
                        showAvatar={true}
                        showHeader={true}
                    />
                )}
                {test && (
                    <Grid item>
                        <PanelTestTreeView panel={test} skipPanel={true} />
                    </Grid>
                )}
            </Grid>
        </>
    )
}
