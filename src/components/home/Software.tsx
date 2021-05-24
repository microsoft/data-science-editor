import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import CenterGrid from "./CenterGrid"
import SplitGrid from "./SplitGrid"
import AppContext, { DrawerType } from "../AppContext"
import CarouselGrid from "./CarouselGrid"
import FeatureItem from "./FeatureItem"
// tslint:disable-next-line: no-submodule-imports match-default-export-name
import AccountTreeIcon from "@material-ui/icons/AccountTree"
import JacdacIcon from "../icons/JacdacIcon"
import KindIcon from "../KindIcon"
import { VIRTUAL_DEVICE_NODE_NAME } from "../../../jacdac-ts/src/jdom/constants"
import HistoryIcon from "@material-ui/icons/History"

export default function Software() {
    const { setDrawerType } = useContext(AppContext)
    const handleShowPackets = () => setDrawerType(DrawerType.Packets)
    const handleShowDeviceTree = () => setDrawerType(DrawerType.Dom)
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

            <SplitGrid
                right={false}
                subtitle="Node-RED."
                description="Add Jacdac to your Node-RED flows."
                buttonText="Jacdac node"
                buttonVariant="link"
                buttonUrl="https://flows.nodered.org/node/node-red-contrib-jacdac"
                image={
                    <StaticImage
                        src="./nodered.png"
                        alt="Jacdac nodes for Node-RED"
                    />
                }
            />

            <CenterGrid
                subtitle2="Developer tools."
                description="Investigate and diagnose issues through our debugging tools."
            />

            <CarouselGrid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<JacdacIcon fontSize="large" />}
                        description="Dashboard"
                        caption="Visualize and interact with physical or simulated devices in the dashboard."
                        buttonText="Try the dashboard"
                        buttonVariant="link"
                        buttonUrl="/dashboard/"
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<AccountTreeIcon fontSize="large" />}
                        description="Device Tree."
                        caption="Inspect devices, services, registers and events in the device tree."
                        buttonText="Open Device Tree"
                        buttonVariant="link"
                        onButtonClick={handleShowDeviceTree}
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<HistoryIcon fontSize="large" />}
                        description="Packet console."
                        caption="Inspect every packet moving on the bus, save and reload traces from the web or your logic analyzer."
                        buttonText="Show packets"
                        buttonVariant="link"
                        onButtonClick={handleShowPackets}
                    />
                </Grid>
            </CarouselGrid>

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


            
*/
