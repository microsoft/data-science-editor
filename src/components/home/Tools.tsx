import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React, { lazy, useContext } from "react"
import CenterGrid from "./CenterGrid"
import SplitGrid from "./SplitGrid"
import AppContext, { DrawerType } from "../AppContext"
import Suspense from "../ui/Suspense"
import {
    SRV_BUTTON,
    SRV_GAMEPAD,
    SRV_DOT_MATRIX,
    SRV_LED_STRIP,
    SRV_POTENTIOMETER,
    SRV_ROLE_MANAGER,
    SRV_SERVO,
} from "../../../jacdac-ts/src/jdom/constants"
import useServiceProviderFromServiceClass from "../hooks/useServiceProviderFromServiceClass"
import useDevices from "../hooks/useDevices"
import DashboardDevice from "../dashboard/DashboardDevice"
const PacketView = lazy(() => import("../tools/PacketView"))

export default function Tools() {
    useServiceProviderFromServiceClass(SRV_BUTTON)
    useServiceProviderFromServiceClass(SRV_GAMEPAD)
    useServiceProviderFromServiceClass(SRV_SERVO)
    useServiceProviderFromServiceClass(SRV_POTENTIOMETER)
    useServiceProviderFromServiceClass(SRV_LED_STRIP)
    useServiceProviderFromServiceClass(SRV_DOT_MATRIX)
    const { setDrawerType } = useContext(AppContext)
    const handleShowDeviceTree = () => setDrawerType(DrawerType.Dom)
    const handleShowPacketConsole = () => setDrawerType(DrawerType.Packets)
    const simulatorClass = SRV_DOT_MATRIX
    const dashboards = useDevices({
        ignoreInfrastructure: true,
        announced: true,
    })
        .filter(
            dev =>
                !dev.hasService(SRV_ROLE_MANAGER) &&
                !dev.hasService(simulatorClass)
        )
        .slice(0, 4)
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Web Tools"
                subtitle3="Visualize, debug, sniff, track, record, replay, update... from your browser."
                imageColumns={6}
                image={<StaticImage src="./dashboard.png" alt="Dashboard" />}
            />

            <SplitGrid
                right={true}
                subtitle="Digital Twins and Simulators."
                description="Visualize and interact with digital twins of physical devices, or simulated devices. Interact with the simulators on the left. To see more details, open the device tree."
                image={
                    <Grid container spacing={1}>
                        {dashboards.map(device => (
                            <Grid item key={device.id} xs={12} sm={6}>
                                <Suspense>
                                    <DashboardDevice device={device} />
                                </Suspense>
                            </Grid>
                        ))}
                    </Grid>
                }
                buttonText="Open Device Tree"
                buttonVariant="link"
                onButtonClick={handleShowDeviceTree}
            />

            <SplitGrid
                right={false}
                subtitle="Packet Console"
                description="Sniff the packet traffic, record and replay traces in the packet console."
                image={
                    <div style={{ height: "14rem" }}>
                        <Suspense>
                            <PacketView />
                        </Suspense>
                    </div>
                }
                buttonText="Open Packet Console"
                buttonVariant="link"
                onButtonClick={handleShowPacketConsole}
            />

            <SplitGrid
                right={true}
                subtitle="Data collector."
                description="Record any register data into a CSV file."
                buttonText="Collect data"
                buttonVariant="link"
                buttonUrl="/tools/collector/"
                image={
                    <StaticImage
                        src="./recordit.png"
                        alt="Data collector user interface"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="Device Tester."
                description="A compliance test suite for module development or the factory floor."
                buttonText="Test your device"
                buttonVariant="link"
                buttonUrl="/tools/device-tester/"
                image={
                    <StaticImage
                        src="./device-tester.png"
                        alt="Device Tester contains a device twin of a device and a tree of unit tests"
                    />
                }
            />

            <CenterGrid
                subtitle2="Can I build my own tools?"
                description="Absolutely! You can use the JavaScript package to build your own Jacdac tooling."
                buttonText="Integrate Jacdac into your web app"
                buttonVariant="link"
                buttonUrl="/clients/javascript/"
            />
        </Grid>
    )
}
