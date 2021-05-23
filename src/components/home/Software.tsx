import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew"
import CameraIcon from "@material-ui/icons/Camera"
import TelegramIcon from "@material-ui/icons/Telegram"
import { SRV_SOIL_MOISTURE } from "../../../jacdac-ts/jacdac-spec/dist/specconstants"
import {
    addServiceProvider,
    serviceProviderDefinitionFromServiceClass,
} from "../../../jacdac-ts/src/servers/servers"
import JacdacContext, { JacdacContextProps } from "../../jacdac/Context"
import AppContext, { DrawerType } from "../AppContext"

export default function Protocol() {
    const { bus } = useContext<JacdacContextProps>(JacdacContext)
    const { setDrawerType } = useContext(AppContext)
    const handleStartSimulator = () => {
        const provider =
            serviceProviderDefinitionFromServiceClass(SRV_SOIL_MOISTURE)
        addServiceProvider(bus, provider)
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
                title="Software"
                subtitle3="Integrate Jacdac into your web, Node.JS or embedded apps."
                imageColumns={6}
                image={<StaticImage src="./dashboard.png" alt="Dashboard" />}
            />

            <CenterGrid
                subtitle2="Low-Code Hardware."
                description="Jacdac client libraries empower developers without embedded or event coding experience."
            />

            <SplitGrid
                right={true}
                subtitle="JavaScript and TypeScript."
                description="From the browser or Node.JS, use our JavaScript/TypeScript library to interact with physical Jacdac devices. If you can build a web page, you can program Jacdac."
                buttonText="JavaScript library"
                buttonVariant="link"
                buttonUrl="/clients/javascript"
                image={
                    <StaticImage
                        src="./html5.png"
                        alt="A Jacdac humidity module plugging into a Jacdac cable"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="Web USB"
                subtitle3="and Web Bluetooth"
                description="No driver installation needed to access the Jacdac devices from your web applications thanks to Web USB or Web Bluetooth."
                image={
                    <StaticImage src="./bustopology.png" alt="Bus topology" />
                }
            />

            <SplitGrid
                right={true}
                subtitle="MakeCode."
                description="Add Jacdac to your micro:bit V2, Arcade or Maker board."
                buttonText="MakeCode library"
                buttonVariant="link"
                buttonUrl="/clients/makecode"
                image={
                    <StaticImage
                        src="./makecode.png"
                        alt="Block code to swipe a servo"
                    />
                }
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
                subtitle2="Can I add Jacdac to my web app?"
                description="Absolutely! You can embed our dashboard or add our JavaScript package."
                buttonText="Integrate Jacdac into your web app"
                buttonVariant="link"
                buttonUrl="/clients/web"
            />
        </Grid>
    )
}

/*


            <CarouselGrid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<TelegramIcon fontSize="large" />}
                        description="Web first."
                        caption="Access physical devices from the browser without driver installation."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<CameraIcon fontSize="large" />}
                        description="NPM or GitHub."
                        caption="Grab it on NPM or rebuild it from our GitHub repositories."
                        buttonText="GitHub"
                        buttonUrl="/github/"
                        buttonVariant="link"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<PowerSettingsNewIcon fontSize="large" />}
                        description="."
                        caption="Specify your own services and deploy them on your devices."
                    />
                </Grid>
            </CarouselGrid>
*/
