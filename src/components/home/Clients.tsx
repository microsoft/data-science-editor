import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CenterGrid from "./CenterGrid"
import HTML5Image from "./HTML5Image"
import SplitGrid from "./SplitGrid"

export default function Clients() {
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <CenterGrid
                title="Jacdac Programming"
                subtitle3="via JavaScript, Python, .NET, MakeCode, ..."
                // imageColumns={6}
                // image={<StaticImage src="./dashboard.png" alt="Dashboard" />}
            />

            <SplitGrid
                right={true}
                subtitle="JavaScript and TypeScript"
                description="From the browser or Node.JS, use our JavaScript/TypeScript library to interact with physical Jacdac devices. If you can build a web page, you can program Jacdac."
                buttonText="JavaScript/TypeScript library"
                buttonVariant="link"
                buttonUrl="/clients/javascript"
                imageColumns={4}
                image={<HTML5Image />}
            />

            <SplitGrid
                right={false}
                subtitle="MakeCode"
                description="Code Jacdac using a micro:bit V2, Arcade or Maker board."
                buttonText="MakeCode extension"
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
                right={true}
                subtitle="Python"
                description="Control hardware from your computer or your Raspberry Pi using Python."
                buttonText="Python library"
                buttonVariant="link"
                buttonUrl="/clients/python"
                imageColumns={6}
                image={
                    <StaticImage
                        src="https://www.python.org/static/community_logos/python-logo-master-v3-TM.png"
                        alt="Python Foundation Logo"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle=".NET"
                description="Control hardware from your computer or your Raspberry Pi using .NET, TinyCLR."
                buttonText=".NET packages"
                buttonVariant="link"
                buttonUrl="/clients/dotnet"
                imageColumns={4}
                image={
                    <StaticImage
                        src="https://raw.githubusercontent.com/dotnet/brand/main/logo/dotnet-logo.jpg"
                        alt=".NET Framework logo"
                    />
                }
            />

            <SplitGrid
                right={true}
                imageColumns={8}
                subtitle="Node-RED"
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

            <SplitGrid
                right={false}
                subtitle="p5*js"
                imageColumns={8}
                description="Physical Creative Coding."
                buttonText="p5.jacdac library"
                buttonVariant="link"
                buttonUrl="/clients/p5js"
                image={
                    <StaticImage
                        src="./p5js.jpg"
                        alt="A p5js program that controls color with sliders."
                    />
                }
            />
        </Grid>
    )
}
