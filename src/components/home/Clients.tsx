import { Grid } from "@material-ui/core"
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
            <SplitGrid
                title="Client SDKs"
                subtitle3="Integrate Jacdac into your web, Node.JS or embedded apps."
                imageColumns={6}
                image={<StaticImage src="./dashboard.png" alt="Dashboard" />}
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

            <SplitGrid
                right={true}
                subtitle="React"
                imageColumns={7}
                description="Context and Hooks for your React apps."
                buttonText="react-jacdac documentation"
                buttonVariant="link"
                buttonUrl="/clients/react"
                image={<StaticImage src="./react.png" alt="React logo." />}
            />

            <SplitGrid
                right={false}
                subtitle="A-Frame"
                imageColumns={7}
                description="Put Reality back into Virtual Reality."
                buttonText="A-Frame demo"
                buttonVariant="link"
                buttonUrl="/clients/a-frame"
                image={
                    <StaticImage
                        src="./a-frame.jpg"
                        alt="Control the radius of a sphere using a slider using our Javascript SDK."
                    />
                }
            />

            <CenterGrid
                subtitle2="Can I embed the dashboard in my web pages?"
                description="Absolutely! With a few lines of HTML, you'll get a dashboard in your web pages."
                buttonText="Copy HTML code to add Jacdac to your web site."
                buttonVariant="link"
                buttonUrl="/clients/embed/"
            />
        </Grid>
    )
}
