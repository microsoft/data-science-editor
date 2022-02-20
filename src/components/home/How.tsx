
import { Grid } from "@mui/material"
import { StaticImage } from "gatsby-plugin-image"
import React, { useContext } from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import HTML5Image from "./HTML5Image"
import DarkModeContext from "../ui/DarkModeContext"

export default function How() {
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
            subtitle="Protocol"
            description="Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
            imageColumns={8}
            image={
                <StaticImage
                    src="./buttoncable.png"
                    alt="A Jacdac humidity module plugging into a Jacdac cable"
                    imgStyle={imgStyle}
                />
            }
            buttonText="Reference"
            buttonVariant="link"
            buttonUrl="/reference/"
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
                    buttonUrl="/clients/"
                    buttonVariant="link"
                />
            </Grid>
        </CarouselGrid>
        </Grid>)
}