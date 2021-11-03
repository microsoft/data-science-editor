import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"

export default function Connector() {
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
            style={{ marginTop: 0 }}
        >
            <SplitGrid
                style={{ paddingTop: 0 }}
                title="Connector"
                description="Jacdac uses 3-pin custom-designed connectors to quickly interface development boards with sensors, relays and more."
                buttonText="Go to specification"
                buttonUrl="https://github.com/microsoft/jacdac-ddk/tree/main/connector"
                imageColumns={6}
                image={<StaticImage src="./tangled.png" alt="Tangled cable" />}
            />
            <CenterGrid
                description="A custom cable connector designed to work in both orientations, to provide a haptic “click” when it plugs in, and to feel nice in your hand."
                caption="Reversible, clickable and ergonomic."
            />
            <Grid item xs={12}>
                <StaticImage
                    src="./competitors.png"
                    alt="Comparing existing cables to Jacdac"
                />
            </Grid>
            <CarouselGrid>
                <Grid item xs={12} sm={6}>
                    <StaticImage
                        src="./mechanicalclickconnector.png"
                        alt="A split view of the cable going into the PCB"
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <StaticImage src="./hub.png" alt="A hub PCB" />
                </Grid>
            </CarouselGrid>
            <SplitGrid
                right={false}
                subtitle="Reversible."
                description="There's no need to worry about accidentally swapping the Power and Data wires on your breadboard. The Jacdac connector is engineered to be completely reversible, so you won't even have to think about the right orientation as you plug the cable."
                imageColumns={6}
                image={
                    <StaticImage
                        src="./buttoncable.png"
                        alt="A cable plugin into a humidity sensor."
                    />
                }
            />
            <SplitGrid
                right={true}
                subtitle="Mechanical feedback."
                description="Jacdac's state-of-the-art hook design delivers an impeccably fluid plug/unplug motion. Plugging the cable and experiencing a snap-fit feeling gives confidence that the connection has been made. This is achieved by two metallic hooks that snap into two slots on the board, always ensuring a robust link."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./fullassembly.png"
                        alt="Close up on cable"
                    />
                }
            />
            <SplitGrid
                right={false}
                subtitle="Ergonomic."
                description=" Regardless being extremely compact (only 9.5x18.5mm), it provides an unprecedented experience in terms of comfort and ergonomic in its everyday use. This makes connecting microcontrollers and peripherals as simple as plugging a USB device into your personal computer."
                image={<StaticImage src="./ucable.png" alt="Short cable" />}
            />
            <CenterGrid
                subtitle="Discover the benefits of Jacdac custom connector."
                description="There are plenty of prototyping cables on the market. The issue is that there are also plenty of compromises that come with using them. They are fiddly, require high dexterity, and are easy to damage."
            />

            <SplitGrid
                right={false}
                subtitle="How does it work?"
                description="The PCB edge connector is made of 3 gold fingers on both sides of the PCB, with two slots on the outer edges for mechanical hooking. The cable connector is made of 3 electrical contact pins and 2 mechanical hooks."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./rhtemp.png"
                        alt="A Jacdac humidity module plugging into a Jacdac cable"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Minimum effort. Maximum flexibility."
                description="The cable has been designed to make it extremely easy to plug in to connect modules together. While at the same time it provides a robust and reliable connection that’s difficult to unplug unvoluntarily. Bring your prototypes to the next level."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./rotary.png"
                        alt="A Jacdac rotary encoder module plugging into a Jacdac cable"
                    />
                }
            />

            <CenterGrid
                subtitle="Lower costs. Higher efficiency."
                description="Not requiring a female port mounted on the Jacdac modules means less sourcing and assembly costs. On top of that, our PCB edge and cable connector have been tested extensively to ensure a consistent experience up to 1500 cycles."
                image={
                    <StaticImage
                        src="./forces.png"
                        alt="The cable insertion and simulated forces."
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Three length."
                description="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the services supported by a device, firmware, and pictures."
                imageColumns={6}
                image={
                    <StaticImage
                        src="./1500mm.png"
                        alt="A rolled up 1500mm Jacdac cable"
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
                        caption="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the services supported by a device, firmware, and pictures."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./threepins.png"
                                alt="3 bars"
                            />
                        }
                        description="Three pins."
                        caption="The packets are transmitted serially on hardware using a 3-wire cable."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./pcbicon.png"
                                alt="PCB icon"
                            />
                        }
                        description="Accepts 1.6mm PCBs."
                        caption="Integrate Jacdac into your web site or node.js application using out TypeScript/JavaScript npm library."
                    />
                </Grid>
            </CarouselGrid>

            <CenterGrid
                subtitle="More cables. More ideas."
                description="Become a Jacdac partner by developing and selling your own ideas of what the cables should look like. As long as they plug into the PCB edge connector on the modules, they are good to go!"
                buttonText="View PCB footprint"
                buttonVariant="link"
                buttonUrl="https://github.com/microsoft/jacdac-ddk/blob/main/connector/JACDAC_PCB_Edge_Connector_Drawing_JD-PEC-01_rev_01.pdf"
                image={
                    <StaticImage
                        src="./pcbfootprint.png"
                        alt="Connector PCB footprint."
                    />
                }
            />
            <CenterGrid
                subtitle="Can I add Jacdac to my PCB?"
                description="Absolutely. We would be thrilled if you used a Jacdac PCB connector on your board or product! You can use the name Jacdac without royalties or attribution."
                buttonText="Integrate Jacdac into your hardware"
                buttonVariant="link"
                buttonUrl="https://github.com/microsoft/jacdac-ddk/tree/main/connector"
            />
        </Grid>
    )
}
