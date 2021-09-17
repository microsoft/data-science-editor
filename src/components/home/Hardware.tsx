import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React, { lazy, Suspense } from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew"
import CameraIcon from "@material-ui/icons/Camera"
import TelegramIcon from "@material-ui/icons/Telegram"
import useMediaQueries from "../hooks/useMediaQueries"
const DeviceSpecificationList = lazy(
    () => import("../specification/DeviceSpecificationList")
)

export default function Protocol() {
    const { mobile, medium } = useMediaQueries()
    const cols = mobile ? 1 : medium ? 3 : 4
    return (
        <Grid
            container
            spacing={10}
            direction="column"
            alignContent="center"
            alignItems="center"
        >
            <SplitGrid
                title="Hardware"
                subtitle3="Integrate Jacdac into your devices."
                imageColumns={6}
                buttonText="Device Development Kit"
                buttonUrl="https://github.com/microsoft/jacdac-ddk"
                image={
                    <StaticImage
                        src="./pcbfootprint.png"
                        alt="PCB connector footprint"
                    />
                }
            />

            <CenterGrid
                subtitle="Plug-and-play."
                description="Every Jacdac device has a tiny micro-controller that runs the Jacdac protocol and communicates with the bus."
                image={
                    <StaticImage
                        src="./rhtempvertical.png"
                        alt="A Jacdac humidity module plugging into a Jacdac cable"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="3-wire serial."
                description="Jacdac packets are sent serially among physical devices over a single data line along with a regulated power line."
                image={
                    <StaticImage src="./bustopology.png" alt="Bus topology" />
                }
                buttonText={"Learn more"}
                buttonVariant="link"
                buttonUrl="/protocol/"
            />

            <SplitGrid
                right={true}
                subtitle="8-bit and up."
                description="Firmware fits on 8-bit micro-controllers to minimize costs"
                imageColumns={8}
                image={
                    <StaticImage
                        src="./jacdacsinglergbledmodule.png"
                        alt="A LED module"
                    />
                }
                buttonText="Device Development Kit"
                buttonVariant="link"
                buttonUrl="https://github.com/microsoft/jacdac-ddk"
            />

            <SplitGrid
                right={false}
                subtitle="PCB Connector."
                description="A PCB edge connector was chosen for Jacdac primarily because it essentially adds no cost to a product."
                buttonText="Physical connector"
                buttonVariant="link"
                buttonUrl="/hardware/connector/"
                imageColumns={6}
                image={
                    <StaticImage
                        src="./mechanicalclickconnector.png"
                        alt="Cable and connector"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle="Power... negociated."
                description="Power is regulated and negociated on the bus to minimize brown-outs, burn-outs and other inconviences."
                imageColumns={8}
                image={
                    <StaticImage
                        src="./rotary.png"
                        alt="A Jacdac rotary encoder module plugging into a Jacdac cable"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle="Firmware Updates."
                description="Jacdac scans for registered devices and can upgrade firmware over the bus."
                imageColumns={4}
                image={
                    <StaticImage
                        src="./firmwareupdate.png"
                        alt="A device with firmware up-to-date"
                    />
                }
                buttonText={"Register device"}
                buttonVariant="link"
                buttonUrl="/tools/device-registration/"
            />

            <Grid item xs={12}>
                <Suspense fallback={null}>
                    <DeviceSpecificationList count={cols} shuffle={true} />
                </Suspense>
            </Grid>

            <CarouselGrid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<TelegramIcon fontSize="large" />}
                        description="Cheap."
                        caption="Add Jacdac to your PCB for a few cents."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<CameraIcon fontSize="large" />}
                        description="Flexible."
                        caption="Hot plug and play with extensive web tooling."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={<PowerSettingsNewIcon fontSize="large" />}
                        description="Extensible."
                        caption="Specify your own services and deploy them on your devices."
                    />
                </Grid>
            </CarouselGrid>

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

            <CenterGrid
                subtitle="Can I add Jacdac to my PCB?"
                description="Absolutely. We would be thrilled if you used a Jacdac PCB connector on your board or product! You can use the name Jacdac without royalties or attribution."
                buttonText="Integrate Jacdac into your hardware"
                buttonVariant="link"
                buttonUrl="/hardware/connector"
            />
        </Grid>
    )
}
