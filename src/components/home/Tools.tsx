import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import CenterGrid from "./CenterGrid"
import SplitGrid from "./SplitGrid"
import AppContext, { DrawerType } from "../AppContext"
import { navigate } from "gatsby-link"

export default function Tools() {
    const { setDrawerType, toggleShowDeviceHostsDialog } =
        useContext(AppContext)
    const handleStartSimulator = () => {
        toggleShowDeviceHostsDialog()
        navigate("/dashboard/")
    }
    const handleShowDeviceTree = () => setDrawerType(DrawerType.Dom)
    const handleShowPacketConsole = () => setDrawerType(DrawerType.Packets)
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
                    <StaticImage
                        src="./rotarysim.png"
                        alt="A rotary encoder dashboard"
                    />
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
                    <StaticImage
                        src="./dashboardlight.png"
                        alt="A simulated light strip"
                    />
                }
                buttonText="Start a simulator"
                buttonVariant="link"
                onButtonClick={handleStartSimulator}
            />

            <SplitGrid
                right={true}
                subtitle="Device Tree"
                description="Inspect devices, services, registers and events in the device tree."
                image={
                    <StaticImage
                        src="./devicetree.png"
                        alt="A tree of devices, services and registers"
                    />
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
                    <StaticImage
                        src="./packetconsole.png"
                        alt="A list of packet"
                    />
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
