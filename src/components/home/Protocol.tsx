import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import DeviceSpecificationList from "../DeviceSpecificationList"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"

export default function Protocol() {
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Protocol"
                subtitle3="Bus topology, dynamic discovery, standardized services for micro-controllers"
                imageColumns={6}
                buttonText="Specification"
                buttonUrl="/reference/protocol"
                image={
                    <StaticImage
                        src="./manymodulestogether.png"
                        alt="Many Modules Together"
                    />
                }
            />
            <CenterGrid description="Jacdac is a bus-based plug-and-play hardware/software stack for microcontrollers and their peripherals (sensors/actuators), with applications to rapid prototyping, making, and physical computing." />

            <SplitGrid
                right={false}
                subtitle="Bus topology."
                description="Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
                image={
                    <StaticImage src="./bustopology.png" alt="Bus topology" />
                }
                buttonText={"Learn more"}
                buttonVariant="link"
                buttonUrl="/reference/protocol/"
            />
            <SplitGrid
                right={true}
                subtitle="Dynamic discovery."
                description="Jacdac devices advertise their services over the bus every half second."
                image={
                    <StaticImage src="./rotary.png" alt="A rotary encoder" />
                }
                buttonText={"Learn more"}
                buttonVariant="link"
                buttonUrl="/reference/protocol/#service-layer"
            />
            <SplitGrid
                right={false}
                subtitle="Standardized services."
                description="Jacdac services are specified to abstract the hardware device from the software implementation. The services are comprised of registers, commands and events, along with precise data layout information for each packet."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./dashboardtemp.png"
                        alt="A view of a temperature humidity sensor"
                    />
                }
                buttonText={"Explore services"}
                buttonVariant="link"
                buttonUrl="/services"
            />

            <CenterGrid
                subtitle="How does it work?"
                description="Every Jacdac device has a micro-controller to run the Jacdac protocol and communicate with the bus."
                image={
                    <StaticImage
                        src="./rhtempvertical.png"
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
                        caption="The device catalog can automatically detect, download and flash firmware onto devices."
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
                        buttonVariant="link"
                        buttonUrl="/software"
                    />
                </Grid>
            </CarouselGrid>

            <SplitGrid
                right={false}
                subtitle="Device Catalog."
                description="Jacdac identifies registered devices on the bus and can automatically find and upload the latest firmware for them."
                imageColumns={6}
                image={<DeviceSpecificationList count={6} />}
                buttonText={"Explore devices"}
                buttonVariant="link"
                buttonUrl="/devices/"
            />

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
