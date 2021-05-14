import { Grid } from "@material-ui/core"
import { StaticImage } from "gatsby-plugin-image"
import React from "react"
import CarouselGrid from "./CarouselGrid"
import CenterGrid from "./CenterGrid"
import FeatureItem from "./FeatureItem"
import SplitGrid from "./SplitGrid"

export default function Home() {
    return (
        <Grid container spacing={8}>
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
                description="Designed for “modular electronics” scenarios that support rapid prototyping, creative exploration, making and learning through physical computing."
                caption="Cheap, flexible and extensible."
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
                description="Jacdac uses 3-pin custom-designed connectors to quickly interface development boards with sensors, LCDs, relays and more."
                image={
                    <StaticImage
                        src="./rotarycable.png"
                        alt="A rotary encoder module with a Jacdac cable attached."
                    />
                }
                buttonText="The new connector and cable"
                buttonVariant="link"
                buttonUrl="/connector"
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
            <CenterGrid
                subtitle="Discover the benefits that Jacdac brings."
                description="Jacdac devices communicate using packets over a bus, where each device can advertise itself and the set of services it provides. A service provides registers, events and commands to communicate with other devices."
            />
            <SplitGrid
                right={false}
                subtitle="How does it work?"
                description="Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
                image={
                    <StaticImage
                        src="./buttoncable.png"
                        alt="A Jacdac humidity module plugging into a Jacdac cable"
                    />
                }
            />
            <SplitGrid
                right={true}
                subtitle="Simulate and communicate from the browser"
                description="The Jacdac bus can be simulated in the browser and communicate to hardware without any driver or program installation."
                image={
                    <StaticImage
                        src="./dashboard.png"
                        alt="A dashboard of simulated devices"
                    />
                }
            />
            <CenterGrid
                title="A cheaper modules' ecosystem"
                description="The cable connector plugs directly on the edge of the module, without requiring any female port on the module side. Just add a tiny microcontroller and your module is Jacdac enabled!"
                image={
                    <StaticImage
                        src="./rhtempvertical.png"
                        alt="Humidity temperature module vertial"
                    />
                }
            />

            <SplitGrid
                right={true}
                title="Beautifully simple."
                description="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the services supported by a device, firmware, and pictures."
                buttonText="Discover the device catalog"
                buttonVariant="link"
                buttonUrl="/devices"
                image={
                    <StaticImage
                        src="./manymodulestogether.png"
                        alt="5 Jacdac modules together"
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
                        subtitle="Hot plug discovery"
                        description="The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the service."
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
                        subtitle="Firmware updates"
                        description="The device catalog is automtically detect, download and flash firmware onto devices."
                    />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <FeatureItem
                        startImage={
                            <StaticImage
                                width={64}
                                src="./html5icon.svg"
                                alt="HTML5 icon"
                            />
                        }
                        subtitle="JavaScript package"
                        description="Integrate Jacdac into your web site or node.js application using our TypeScript/JavaScript npm package."
                    />
                </Grid>
            </CarouselGrid>

            <CenterGrid
                subtitle="Can I add Jacdac to my PCB?"
                description="Absolutely. We would be thrilled if you used a Jacdac PCB connector on your board or product! You can use the name Jacdac without royalties or attribution."
                buttonText="Integrate Jacdac into your hardware"
                buttonVariant="link"
                buttonUrl="/connector"
            />
        </Grid>
    )
}

/*
<SplitGrid
                right={false}
                subtitle={"Connector"}
                description={
                    "Jacdac uses 3-pin custom-designed connectors to quickly interface development boards with sensors, LCDs, relays and more."
                }
                buttonUrl="/connector"
                image={
                    <StaticImage
                        src={"./mechanicalclickconnector.png"}
                        alt="Jacdac mechanical click connector"
                    />
                }
            />
            <SplitGrid
                right={true}
                subtitle={"Protocol"}
                description={
                    "Jacdac devices communicate using packets over a bus, where each device can advertise itself and the set of services it provides. A service provides registers, events and commands to communicate with other devices."
                }
                buttonUrl="/reference/protocol/"
                image={
                    <StaticImage
                        src={"./bustopology.png"}
                        alt="Four cable joining into a module"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle={"Service specifications"}
                description={
                    "Jacdac services are specified to abstract the hardware device from the software implementation. The services are comprised of registers, commands and events, along with precise data layout information for each packet."
                }
                buttonUrl="/services"
                image={
                    <StaticImage
                        src={"./dashboardtemp.png"}
                        alt="A dashboard of humidity temperature module"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle={"Device catalog"}
                description={
                    "The device catalog lists the registered Jacdac devices that can be automatically detected on the bus. The catalog information provides vendor information, the services supported by a device, firmware, and pictures."
                }
                buttonUrl="/devices"
                image={
                    <StaticImage
                        src={"./jacdacrhtempmodule.png"}
                        alt="A humidity temperature module"
                    />
                }
            />

            <SplitGrid
                right={false}
                subtitle={"Firmware updates"}
                description={
                    "The device catalog is automtically detect, download and flash firmware onto devices."
                }
                buttonUrl="/tools/updater"
                image={
                    <StaticImage
                        src={"./jacdacsinglergbledmodule.png"}
                        alt="A single color LED module"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle={"Transport"}
                description={
                    "Jacdac packets are sent serially among physical devices on the Jacdac bus and may also be sent over WebUSB/WebBLE, providing connectivity to web-based tooling and services running in the web browser."
                }
                buttonUrl={"/reference/protocol/#transport-layer"}
                image={
                    <StaticImage src={"./longcable.png"} alt="A long cable" />
                }
            />

            <SplitGrid
                right={false}
                subtitle={"Web simulators and tools"}
                description={
                    "The Jacdac bus can be simulated in the browser and communicate to hardware without any driver or program installation."
                }
                buttonText="Dasboard"
                buttonUrl="/dashboard"
                image={
                    <StaticImage
                        src={"./dashboardlight.png"}
                        alt="A single color LED module"
                    />
                }
            />

            <SplitGrid
                right={true}
                subtitle={"JavaScript package"}
                description={
                    "Integrate Jacdac into your web site or node.js application using our TypeScript/JavaScript npm library."
                }
                buttonUrl="/clients/web"
                imageColumns={3}
                image={<StaticImage src={"./html5.png"} alt="HTML5 logo" />}
            />
        </Grid>
        */
