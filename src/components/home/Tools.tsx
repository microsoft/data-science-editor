import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { lazy, useContext } from "react"
import CenterGrid from "./CenterGrid"
import SplitGrid from "./SplitGrid"
import AppContext, { DrawerType } from "../AppContext"
import Suspense from "../ui/Suspense"
import {
    SRV_BUTTON,
    SRV_JOYSTICK,
    SRV_LED_MATRIX,
    SRV_LED_PIXEL,
    SRV_POTENTIOMETER,
    SRV_ROLE_MANAGER,
    SRV_SERVO,
} from "../../../jacdac-ts/src/jdom/constants"
import useServiceProviderFromServiceClass from "../hooks/useServiceProviderFromServiceClass"
import useDevices from "../hooks/useDevices"
import DashboardDevice from "../dashboard/DashboardDevice"
const JDomTreeView = lazy(() => import("../tools/JDomTreeView"))
const PacketView = lazy(() => import("../tools/PacketView"))

export default function Tools() {
    useServiceProviderFromServiceClass(SRV_BUTTON)
    useServiceProviderFromServiceClass(SRV_JOYSTICK)
    useServiceProviderFromServiceClass(SRV_SERVO)
    useServiceProviderFromServiceClass(SRV_POTENTIOMETER)
    useServiceProviderFromServiceClass(SRV_LED_PIXEL)
    useServiceProviderFromServiceClass(SRV_LED_MATRIX)
    const { setDrawerType } = useContext(AppContext)
    const handleShowDeviceTree = () => setDrawerType(DrawerType.Dom)
    const handleShowPacketConsole = () => setDrawerType(DrawerType.Packets)
    const simulatorClass = SRV_LED_MATRIX
    const dashboards = useDevices({ ignoreSelf: true, announced: true })
        .filter(
            dev =>
                !dev.hasService(SRV_ROLE_MANAGER) &&
                !dev.hasService(simulatorClass)
        )
        .slice(0, 4)
    const simulator = useDevices({
        ignoreSelf: true,
        announced: true,
        serviceClass: simulatorClass,
    })?.[0]

    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Tools"
                subtitle3="Get productive with Jacdac."
                imageColumns={6}
                image={<StaticImage src="./dashboard.png" alt="Dashboard" />}
            />

            <CenterGrid
                subtitle2="Developer tools."
                description="Investigate and diagnose issues through our debugging tools."
            />

            <SplitGrid
                right={true}
                subtitle="Dashboard"
                description="Visualize and interact with physical or simulated devices in the dashboard."
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
                buttonText="Try the dashboard"
                buttonVariant="link"
                buttonUrl="/dashboard/"
            />

            <SplitGrid
                right={false}
                subtitle="Simulators."
                description="Spin up virtual device and services to test your client software. Both physical and simulated devices can interact together."
                image={
                    <>
                        {simulator && (
                            <Suspense>
                                <DashboardDevice device={simulator} />
                            </Suspense>
                        )}
                    </>
                }
            />

            <SplitGrid
                right={true}
                subtitle="Device Tree"
                description="Inspect devices, services, registers and events in the device tree."
                image={
                    <Suspense>
                        <JDomTreeView />
                    </Suspense>
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

            <CenterGrid
                subtitle2="Data Science tools."
                description="Collect data."
            />

            <CenterGrid
                subtitle2="Can I build my own tools?"
                description="Absolutely! You can our JavaScript package to build your own Jacdac tooling."
                buttonText="Integrate Jacdac into your web app"
                buttonVariant="link"
                buttonUrl="/clients/web"
            />
        </Grid>
    )
}
