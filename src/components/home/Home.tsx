import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus"
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck"
import FindReplaceIcon from "@mui/icons-material/FindReplace"
import SubscriptionsIcon from "@mui/icons-material/Subscriptions"
import HTML5Image from "./HTML5Image"

export default function Home() {
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
                    />
                }
            />
            <CenterGrid
                subtitle3="A hardware/software stack that bridges the world of low-cost microcontrollers to the web browser and beyond."
                description="Cheap, flexible and extensible."
            />
            <SplitGrid
                right={false}
                subtitle="Hardware"
                description="Jacdac uses a 3-wire bus for power delivery and data transfer. A purpose-built connector is used to interface with the Jacdac PCB edge connector."
                image={
                    <StaticImage
                        src="./rotarycable.png"
                        alt="A rotary encoder module with a Jacdac cable attached."
                    />
                }
                buttonText="Physical interconnect"
                buttonVariant="link"
                buttonUrl="/hardware/"
            />
            <SplitGrid
                right={true}
                subtitle="Protocol"
                description="Bus topology, dynamic discovery, services designed for micro-controllers."
                buttonText="Learn more"
                buttonVariant="link"
                buttonUrl="/protocol/"
                image={
                    <StaticImage
                        src="./bustopology.png"
                        alt="Four cables joining into a hub"
                    />
                }
            />
            <SplitGrid
                right={false}
                subtitle="'Nano' Services"
                description="Jacdac services provide software an abstract view of the hardware. Services are defined in terms of registers, commands and events."
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

            <SplitGrid
                right={true}
                subtitle="Client SDKs"
                description="Integrate Jacdac into your Web pages, Node.JS apps or Python scripts."
                buttonText="Use Jacdac"
                buttonVariant="link"
                buttonUrl="/software/"
                image={<HTML5Image />}
            />

            <SplitGrid
                right={false}
                subtitle="Tools"
                description="Visualize, debug, sniff, track, record, replay, update... from your browser."
                buttonText="Get productive with Jacdac"
                buttonVariant="link"
                buttonUrl="/tools/"
                image={<StaticImage src="./devicetree.png" alt="Device tree" />}
            />

            <CenterGrid
                subtitle="Discover the benefits of Jacdac protocol"
                description="Jacdac devices communicate using packets over a bus, where each device advertises itself and its set of services."
                buttonText="Protocol specification"
                buttonVariant="link"
                buttonUrl="/protocol/"
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

            <CenterGrid
                subtitle="Enabling a cheaper ecosystem."
                description="A PCB edge connector was chosen for Jacdac as it adds no cost to a product. 
                A module is a small PCB that includes an MCU connected to an on-board sensor or actuator."
                image={
                    <StaticImage
                        src="./beautifysimple.png"
                        alt="An array of Jacdac modules"
                    />
                }
                buttonText="Devices"
                buttonVariant="link"
                buttonUrl="/devices/"
            />

            <SplitGrid
                right={true}
                subtitle="For Manufacturers"
                description="Create Jacdac devices."
                imageColumns={6}
                centered={true}
                buttonText="Device Development Kit"
                buttonUrl="/hardware/ddk/"
                buttonVariant="link"
                image={
                    <StaticImage
                        src="./pcbfootprint.png"
                        alt="PCB connector footprint"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="How does it work?"
                description="Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./buttoncable.png"
                        alt="A Jacdac humidity module plugging into a Jacdac cable"
                    />
                }
            />

            <CarouselGrid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./hotplugicon.svg"
                                alt="Icon of two plugs connecting"
                            />
                        }
                        description="Hot plug discovery"
                        caption="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus, and their services. The catalog information also provides vendor information."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./firmwareupdateicon.svg"
                                alt="Firmware icon"
                            />
                        }
                        description="Firmware updates"
                        caption="The device catalog enables the automatic detection, download and flashing of firmware onto devices."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<HTML5Image icon={true} />}
                        description="JavaScript package"
                        caption="Integrate Jacdac into your web site or node.js application using our TypeScript/JavaScript npm package."
                        buttonText="Learn more"
                        buttonUrl="/software/"
                        buttonVariant="link"
                    />
                </Grid>
            </CarouselGrid>

            <CenterGrid
                subtitle="Can I add Jacdac to my PCB?"
                description="Absolutely. We would be thrilled if you used a Jacdac PCB connector on your board or product! You can use the name Jacdac without royalties or attribution."
                buttonText="Integrate Jacdac into your hardware"
                buttonVariant="link"
                buttonUrl="/hardware/"
            />

            <CenterGrid
                subtitle="Can I add Jacdac to my app?"
                description="Absolutely! Use our client software to integrate into your apps."
                buttonText="Integrate Jacdac into your apps"
                buttonVariant="link"
                buttonUrl="/clients/"
            />
        </Grid>
    )
}
