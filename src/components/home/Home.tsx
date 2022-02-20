import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"
import FindReplaceIcon from "@mui/icons-material/FindReplace"
import SubscriptionsIcon from "@mui/icons-material/Subscriptions"
import HTML5Image from "./HTML5Image"
import DarkModeContext from "../ui/DarkModeContext"

export default function Home() {
    const { imgStyle } = useContext(DarkModeContext)
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Jacdac"
                subtitle="plug-and-play for microcontrollers"
                imageColumns={6}
                image={
                    <StaticImage
                        src="./manymodules2.png"
                        alt="Many Modules Together"
                        imgStyle={imgStyle}
                    />
                }
            />
            <CenterGrid
                subtitle3="A hardware/software stack that bridges the world of low-cost microcontrollers to the web browser and beyond."
                description="Cheap, flexible and extensible."
            />

            <SplitGrid
                right={false}
                subtitle="Devices"
                description="Jacdac devices communicate over a 3-wire bus."
                image={
                    <StaticImage
                        src="./rotarycable.png"
                        alt="A rotary encoder module with a Jacdac cable attached."
                        imgStyle={imgStyle}
                    />
                }
                buttonText="Device Catalog"
                buttonVariant="link"
                buttonUrl="/devices/"
            />

            <SplitGrid
                right={false}
                subtitle="Edge Connector"
                description="Jacdac's PCB edge connector is robust, double-sided, low cost."
                buttonText="Edge connector"
                buttonVariant="link"
                buttonUrl="/overview/connector/"
                imageColumns={6}
                image={
                    <StaticImage
                        src="./mechanicalclickconnector.png"
                        alt="Cable and connector"
                        imgStyle={imgStyle}
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="Cable"
                description="Cables make plug-and-play simple and error-free."
                buttonText="Cable"
                buttonVariant="link"
                buttonUrl="/overview/cable/"
                imageColumns={6}
                image={<StaticImage src="./ucable.png" alt="Short cable" />}
            />


            <SplitGrid
                right={false}
                subtitle="Programming"
                description="Program with JavaScript, .NET, Python, MakeCode, ..."
                buttonText="Program Jacdac"
                buttonVariant="link"
                buttonUrl="/clients/"
                image={<HTML5Image />}
            />

            <SplitGrid
                right={false}
                subtitle="Web Tools"
                description="Visualize, debug, sniff, track, record, replay, update... from your browser."
                buttonText="Get productive with Jacdac"
                buttonVariant="link"
                buttonUrl="/tools/"
                image={<StaticImage src="./devicetree.png" alt="Device tree" />}
            />

            <SplitGrid
                right={false}
                subtitle="Services"
                description="Jacdac services provide software an abstract view of a device's features. Services are defined in terms of registers, commands and events."
                buttonText="Explore services"
                buttonVariant="link"
                buttonUrl="/services/"
                image={
                    <StaticImage
                        src="./dashboard.png"
                        alt="Dashboard of devices"
                    />
                }
            />

            <CenterGrid
                subtitle="Discover the benefits of Jacdac"
                description="Jacdac devices send packets over a bus--each device advertises itself and its set of services."
            />

            <CarouselGrid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<DirectionsBusIcon fontSize="large" />}
                        description="Bus topology"
                        caption="Jacdac packets are sent among devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<PlaylistAddCheckIcon fontSize="large" />}
                        description="Device discovery and service advertisement"
                        caption="Any device that hosts a service must also run the control service, which is responsible for advertising any services a device is running every 500 milliseconds."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<FindReplaceIcon fontSize="large" />}
                        description="Standardized service abstraction"
                        caption="Services allow devices with different hardware, but the same functionality, to replace one another - no need to recompile user applications."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<SubscriptionsIcon fontSize="large" />}
                        description="Full stack from 8bit MCU to web development"
                        caption="The physical protocol layer sends/receives a byte buffer (representing a Jacdac frame): Single Wire Serial connects MCUs to each other using UART."
                    />
                </Grid>
            </CarouselGrid>

            <SplitGrid
                right={true}
                subtitle="For Manufacturers"
                description="Add Jacdac to your devices. Schematics, footprints, libraries, open source hardware designs."
                imageColumns={6}
                centered={true}
                buttonText="Device Development Kit"
                buttonUrl="/ddk/"
                buttonVariant="link"
                image={
                    <StaticImage
                        src="./pcbfootprint.png"
                        alt="PCB connector footprint"
                    />
                }
            />
        </Grid>
    )
}
