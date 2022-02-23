/* eslint-disable jsx-a11y/media-has-caption */
import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import SplitGrid from "./SplitGrid"
import CenterGrid from "./CenterGrid"

export default function ConnectorCable() {
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
                description="Jacdac devices feature 3-pin PCB-based double-sided edge connectors."
                // buttonText="Device Development Kit"
                // buttonUrl="/ddk/"
                imageColumns={6}
                image={
                    <StaticImage
                    src="./mechanicalclickconnector.png"
                    alt="A split view of the cable going into the PCB"
                />
                //<StaticImage src="./tangled.png" alt="Tangled cable" />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Reversible."
                description="There's no need to worry about accidentally swapping the Power and Data wires. The PCB connector is engineered to be completely reversible, so you won't even have to think about the right orientation as you plug in the cable."
                imageColumns={6}
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
                title="Cable"
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
                right={true}
                subtitle="Ergonomic."
                description=" Regardless being extremely compact (only 9.5x18.5mm), it provides an unprecedented experience in terms of comfort and ergonomic in its everyday use. This makes connecting microcontrollers and peripherals as simple as plugging a USB device into your personal computer."
                image={<StaticImage src="./ucable.png" alt="Short cable" />}
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
                subtitle="Discover the benefits of Jacdac custom connector and cable."
                description="There are plenty of prototyping connectors/cables on the market. The issue is that there are also plenty of compromises that come with using them. They are fiddly, require high dexterity, and are easy to damage."
            />

            <Grid item xs={12}>
                <StaticImage
                    src="./competitors.png"
                    alt="Comparing existing cables to Jacdac"
                />
            </Grid>
        </Grid>
    )
}
