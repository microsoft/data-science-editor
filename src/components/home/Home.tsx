import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import DirectionsBusIcon from "@material-ui/icons/DirectionsBus"
import PlaylistAddCheckIcon from "@material-ui/icons/PlaylistAddCheck"
import FindReplaceIcon from "@material-ui/icons/FindReplace"
import SubscriptionsIcon from "@material-ui/icons/Subscriptions"

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
                buttonText="Try the dashboard"
                buttonUrl="/dashboard"
                imageColumns={6}
                image={
                    <StaticImage
                        src="./manymodulestogether.png"
                        alt="Many Modules Together"
                    />
                }
            />
            <CenterGrid
                subtitle3="Not only a new protocol designed for easier physical connectivity. It is an entire stack that bridges the world of the low cost microcontroller to the web browser and beyond."
                description="Cheap, flexible and extensible."
            />
            <Grid item xs={12}>
                <StaticImage
                    src="./gallery.png"
                    alt="A gallery of Jacdac modules"
                />
            </Grid>
            <CarouselGrid>
                <Grid item xs={12} sm={6}>
                    <StaticImage
                        src="./tangled.png"
                        alt="Tangled Jacdac cable"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StaticImage src="./hub.png" alt="A hub PCB" />
                </Grid>
            </CarouselGrid>
            <SplitGrid
                right={false}
                subtitle="Plug it in."
                description="Jacdac relies on a 3-wire bus for power delivery and data transfer. A purpose-built connector is used to interface with the Jacdac PCB edge connector."
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
                subtitle="Visualize it."
                description="Jacdac services are specified to abstract the hardware device from the software implementation. The services are comprised of registers, commands and events, along with precise data layout information for each packet."
                buttonText="Try the dashboard web simulator"
                buttonVariant="link"
                buttonUrl="/dashboard"
                image={
                    <StaticImage
                        src="./rotarysim.png"
                        alt="Web simulator of a rotary encoder"
                    />
                }
            />
            <SplitGrid
                right={false}
                subtitle="Record it."
                description="Instantly start to collect streaming data from Jacdac devices into various output formats. Yes, it’s as easy as it sounds."
                buttonText="Try the data collector"
                buttonVariant="link"
                buttonUrl="/tools/data-collector"
                imageColumns={8}
                image={
                    <StaticImage
                        src="./recordit.png"
                        alt="Charts of recorded data"
                    />
                }
            />

            <CenterGrid
                subtitle="Discover the benefits of Jacdac protocol."
                description="Jacdac devices communicate using packets over a bus, where each device can advertise itself and the set of services it provides. A service provides registers, events and commands to communicate with other devices."
                buttonText="Protocol specification"
                buttonVariant="link"
                buttonUrl="/protocol/"
            />

            <CarouselGrid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<DirectionsBusIcon fontSize="large" />}
                        description="Bus topology"
                        caption="Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<PlaylistAddCheckIcon fontSize="large" />}
                        description="Device discovery and service advertisement"
                        caption="Any device that hosts a service must also run the control service. The control service is responsible for advertising any services a device is running every 500 milliseconds."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<FindReplaceIcon fontSize="large" />}
                        description="Standardized service abstraction"
                        caption="This abstraction brings plug-and-play dynamism to Jacdac so that devices with different hardware, but the same overall functionality, can replace one another without having to recompile user applications."
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <FeatureItem
                        startImage={<SubscriptionsIcon fontSize="large" />}
                        description="Full stack from 8bit MCU to web development"
                        caption="The responsibility of the physical layer is to send/receive a byte buffer (representing a Jacdac frame from the transport layer over a particular media): Single Wire Serial connects MCUs to each other using UART, WebUSB connects MCU to web browser"
                    />
                </Grid>
            </CarouselGrid>

            <CenterGrid
                subtitle="Enabling a cheaper ecosystem."
                description="A PCB edge connector was chosen for Jacdac primarily because it essentially adds no cost to a product. A module is a small PCB that includes an MCU connected to an on-board sensor or actuator."
                image={
                    <StaticImage
                        src="./rhtempvertical.png"
                        alt="Humidity temperature module vertial"
                    />
                }
                buttonText="Hardware overview"
                buttonVariant="link"
                buttonUrl="/hardware/"
            />

            <SplitGrid
                right={true}
                subtitle="Time to join."
                description="The Jacdac Device Development Kit (DDK) is for 3rd party hardware designers, firmware developers and manufacturers who wish to create their own Jacdac devices."
                imageColumns={8}
                centered={true}
                buttonText="Device Development Kit"
                buttonUrl="https://github.com/microsoft/jacdac-ddk"
                buttonVariant="link"
                image={
                    <StaticImage
                        src="./beautifysimple.png"
                        alt="An array of Jacdac modules"
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
                        caption="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the service."
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
                        caption="The device catalog is automatically detect, download and flash firmware onto devices."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./html5.png"
                                alt="HTML5 icon"
                            />
                        }
                        description="JavaScript package"
                        caption="Integrate Jacdac into your web site or node.js application using our TypeScript/JavaScript npm package."
                        buttonText="Learn more"
                        buttonUrl="/clients/javascript"
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
        </Grid>
    )
}
