/* eslint-disable jsx-a11y/media-has-caption */
import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import SplitGrid from "./SplitGrid"
import CenterGrid from "./CenterGrid"

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
        </Grid>
    )
}
